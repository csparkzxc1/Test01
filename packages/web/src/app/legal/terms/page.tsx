export const metadata = { title: "이용약관 · 하루" };

const UPDATED_AT = "2026-04-19";

export default function TermsPage() {
  return (
    <div className="space-y-6 text-[15px] leading-7">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">이용약관</h1>
        <p className="text-sm text-haru-muted mt-2">시행일: {UPDATED_AT}</p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">제1조 (목적)</h2>
        <p>
          본 약관은 이용자가 &quot;하루&quot;(이하 &quot;서비스&quot;)를 이용함에 있어 회사와
          이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">제2조 (계정)</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>만 14세 이상의 자만 가입할 수 있습니다.</li>
          <li>이용자는 비밀번호를 안전하게 관리할 책임이 있습니다.</li>
          <li>타인의 정보를 도용하여 가입한 경우 서비스 이용이 제한될 수 있습니다.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">제3조 (서비스 이용)</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>이용자는 서비스를 개인적·비상업적 목적으로만 이용할 수 있습니다.</li>
          <li>회사는 안정적 운영을 위해 사전 공지 후 일시 중단할 수 있습니다.</li>
          <li>자동화 도구·크롤링 등으로 서비스를 과다 호출하는 행위는 금지됩니다.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">제4조 (유료 서비스)</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>프리미엄 구독은 결제 즉시 개시되며, 매 결제 주기마다 자동 갱신됩니다.</li>
          <li>해지는 가입과 동일한 절차 이내로 가능하며, 다음 결제일 전까지 취소하시면 이후 과금되지 않습니다.</li>
          <li>결제 후 7일 이내 서비스를 이용하지 않은 경우 전액 환불이 가능합니다 (전자상거래법).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">제5조 (데이터)</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>이용자가 입력한 할 일·메모의 저작권은 이용자에게 있습니다.</li>
          <li>회사는 서비스 제공을 위해 필요한 최소 범위에서 데이터를 저장·처리합니다.</li>
          <li>탈퇴 시 관련 데이터는 즉시 파기됩니다.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">제6조 (AI 어시스턴트)</h2>
        <p>
          AI 어시스턴트 기능은 선택 사항이며, 이용자의 명시적 동의 하에서만 Anthropic의
          Claude API에 텍스트가 전송됩니다. 개인 식별 정보는 발송 전 마스킹됩니다. 회사는
          AI 공급자에 학습 목적으로 데이터가 사용되지 않도록 계약합니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">제7조 (책임의 제한)</h2>
        <p>
          천재지변, 네트워크 장애 등 불가항력으로 인한 서비스 중단에 대해서는 책임을 지지
          않습니다. 이용자의 귀책 사유로 인한 손해도 이에 준합니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">제8조 (준거법 및 관할)</h2>
        <p>
          본 약관의 해석 및 이용자와의 분쟁은 대한민국 법률에 따르며, 관할 법원은 민사소송법
          상의 관할 법원으로 합니다.
        </p>
      </section>
    </div>
  );
}
