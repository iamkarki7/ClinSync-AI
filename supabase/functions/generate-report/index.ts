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

    const { reportType = 'clinical_summary', userId, fileIds = [] } = await req.json();
    console.log('Generating report:', reportType);

    // Get file data for report generation
    const { data: files } = await supabaseClient
      .from('uploaded_files')
      .select('*')
      .eq('user_id', userId)
      .eq('processing_status', 'completed');

    const fileData = files?.map(f => f.metadata?.processed_data).join('\n\n') || '';

    // Generate report with OpenAI
    const reportPrompts = {
      clinical_summary: 'Generate a comprehensive clinical trial summary report including subject enrollment, completion rates, primary endpoints, and key findings.',
      compliance_report: 'Generate a compliance report highlighting protocol adherence, deviations, audit findings, and regulatory compliance status.',
      data_validation: 'Generate a data validation report showing data quality metrics, missing values, outliers, and validation rule results.',
      audit_trail: 'Generate an audit trail report documenting all data changes, user actions, timestamps, and system events.'
    };

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
            content: `You are a clinical research expert. ${reportPrompts[reportType as keyof typeof reportPrompts]} Format as structured JSON with sections, metrics, and actionable insights.` 
          },
          { role: 'user', content: `Generate a ${reportType} report based on this clinical trial data: ${fileData}` }
        ],
        max_tokens: 3000
      }),
    });

    const aiResult = await openAIResponse.json();
    const reportContent = aiResult.choices[0].message.content;

    // Save report to database
    const { data: report, error } = await supabaseClient
      .from('generated_reports')
      .insert({
        user_id: userId,
        title: `${reportType.replace('_', ' ').toUpperCase()} Report - ${new Date().toLocaleDateString()}`,
        report_type: reportType,
        content: { report: reportContent },
        file_references: fileIds,
        status: 'generated'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Report generated successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      report,
      message: 'Report generated successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-report function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});