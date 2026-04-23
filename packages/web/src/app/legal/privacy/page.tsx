export const metadata = { title: "개인정보 처리방침 · 하루" };

const UPDATED_AT = "2026-04-19";

export default function PrivacyPage() {
  return (
    <div className="space-y-6 text-[15px] leading-7">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">개인정보 처리방침</h1>
        <p className="text-sm text-haru-muted mt-2">최종 개정일: {UPDATED_AT}</p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">1. 수집하는 개인정보 항목</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>필수: 이메일, 비밀번호(해시), 닉네임</li>
          <li>소셜 로그인 시: 카카오 계정 ID, 프로필 닉네임, 프로필 이미지 URL</li>
          <li>서비스 이용 기록: 할 일·프로젝트·태그 입력값, 기기 식별자, 접속 IP, 접속 로그</li>
          <li>선택: 마케팅 수신 동의 여부</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">2. 수집·이용 목적</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>회원 식별 및 로그인</li>
          <li>할 일 동기화 및 알림 발송</li>
          <li>CS 대응 및 부정 이용 방지</li>
          <li>서비스 개선 (통계 목적, 식별정보 제거 후 사용)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">3. 보유 및 이용기간</h2>
        <p>
          회원 탈퇴 즉시 파기함을 원칙으로 합니다. 단, 관계 법령에 따라 보존이 필요한 경우
          아래 기간 동안 분리 보관합니다.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>전자상거래 계약·결제 기록: 5년 (전자상거래법)</li>
          <li>접속 로그: 3개월 (통신비밀보호법)</li>
          <li>부정이용 기록: 1년</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">4. 제3자 제공</h2>
        <p>
          회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 단, 이용자의 사전
          동의가 있거나 법령에 근거한 요청이 있는 경우에 한합니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">5. 처리위탁</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>네이버클라우드플랫폼(NCP): 국내 저장 및 인프라 운영</li>
          <li>Kakao: 소셜 로그인 제공</li>
          <li>Anthropic: AI 어시스턴트 기능 (이용자 옵트인 시에 한함)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">6. 국외 이전</h2>
        <p>
          기본 데이터는 국내(NCP 서울 리전)에 저장됩니다. AI 어시스턴트 이용 시 Anthropic
          서버(미국)로 일부 데이터가 전송될 수 있으며, 이는 별도 동의를 받습니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">7. 이용자의 권리</h2>
        <p>
          이용자는 언제든지 개인정보 열람·정정·삭제·처리정지를 요청할 수 있습니다. 앱
          설정 &gt; 계정 메뉴 또는 고객센터를 통해 요청하실 수 있습니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">8. 개인정보 보호책임자</h2>
        <p>보호책임자: 담당자 지정 예정 · 문의: privacy@haru.app</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">9. 변경 고지</h2>
        <p>
          본 방침은 법령·정책 변경에 따라 개정될 수 있으며, 중요한 변경 사항은 시행 7일
          전에 공지합니다.
        </p>
      </section>
    </div>
  );
}
