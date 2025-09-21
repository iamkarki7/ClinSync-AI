import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { fileId, fileName, fileContent } = await req.json();
    console.log('Processing file:', fileName);

    // Update processing status
    await supabaseClient
      .from('uploaded_files')
      .update({ processing_status: 'processing' })
      .eq('id', fileId);

    // Process file content with OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a clinical trial data validation expert. Analyze the provided eCRF data and extract key information including subject IDs, visit dates, form types, validation issues, and compliance status. Return structured JSON data.' 
          },
          { role: 'user', content: `Process this clinical trial data: ${fileContent}` }
        ],
        max_tokens: 2000
      }),
    });

    const aiResult = await openAIResponse.json();
    const processedData = aiResult.choices[0].message.content;

    // Update file with processed data
    const { error: updateError } = await supabaseClient
      .from('uploaded_files')
      .update({ 
        processing_status: 'completed',
        metadata: { processed_data: processedData }
      })
      .eq('id', fileId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    console.log('File processed successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'File processed successfully',
      processedData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-upload function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});