import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, data } = body;

  let prompt = '';

  if (type === 'diagnosis') {
    prompt = `당신은 의료 기록 작성을 돕는 AI 어시스턴트입니다.
다음 환자 정보와 증상을 바탕으로 진료 기록 초안을 작성해주세요.

환자 정보:
- 이름: ${data.patientName}
- 나이: ${data.age}세
- 성별: ${data.gender}
- 주요 증상(Chief Complaint): ${data.chiefComplaint}
- 상세 증상: ${data.symptoms}
${data.allergies ? `- 알레르기: ${data.allergies}` : ''}
${data.chronicDiseases ? `- 기저 질환: ${data.chronicDiseases}` : ''}

다음 형식으로 진료 기록을 작성해주세요:
1. 추정 진단: (진단명)
2. 진단 코드: (ICD-10 코드)
3. 치료 계획: (치료 내용)
4. 처방 제안: (약물명, 용량, 복용법)
5. 추가 검사: (필요한 검사)
6. 주의사항: (환자에게 전달할 주의사항)

의학적으로 정확하고 전문적인 내용을 작성하되, 최종 진단은 담당 의사가 확인해야 함을 명시하세요.`;
  } else if (type === 'summary') {
    prompt = `다음 진료 기록을 환자가 이해하기 쉬운 언어로 요약해주세요:

진단: ${data.diagnosis}
치료: ${data.treatment}
처방: ${data.prescription || '없음'}
주의사항: ${data.notes || '없음'}

간결하고 명확하게 3-5문장으로 요약해주세요.`;
  } else if (type === 'prescription') {
    prompt = `다음 진단에 적합한 표준 처방을 제안해주세요:

진단명: ${data.diagnosis}
환자 나이: ${data.age}세
알레르기: ${data.allergies || '없음'}

약물명, 용량, 복용 횟수, 기간을 포함하여 처방전 형식으로 작성해주세요.
반드시 "이 처방은 참고용이며 담당 의사의 최종 확인이 필요합니다"라고 명시하세요.`;
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 });
    }

    return NextResponse.json({ result: content.text });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json({ error: 'AI 서비스 오류가 발생했습니다.' }, { status: 500 });
  }
}
