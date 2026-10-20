"use client";

import { Layout } from "@/components/Layout";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
// * as S 임포트 유지
import * as UI from '@/components/ui';

import view from '@/styles/WorkPage.module.scss';
import { PageHeader } from '@/components/ui/DataView';

import Script from "next/script";
import { Button } from '@/components/ui/Button';

import styles from './Mypage.module.scss'

export default function MyPageClient() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState("");

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("로그인이 필요합니다.");
      router.push("/");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8080/api/members/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } } // JWT 토큰을 헤더에 담아 전송
      );
      alert("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");

      // 보안을 위해 기존 토큰 파기 후 로그인 화면으로 이동
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      router.push("/");
    } catch (error: any) {
      alert(error.response?.data || "비밀번호 변경에 실패했습니다.");
    }
  };

  // 2. 다음 우편번호 검색 API 핸들러 완성
  const handleAddressSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function (data: any) {
          // 도로명 주소의 노출 규칙에 따라 주소를 조합
          let fullAddress = data.address;
          let extraAddress = "";

          if (data.addressType === "R") {
            if (data.bname !== "") extraAddress += data.bname;
            if (data.buildingName !== "")
              extraAddress +=
                extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
            fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
          }

          // 주소 상태 업데이트
          // setFormData((prev) => ({
          //   ...prev,
          //   address: fullAddress,
          // }));
        },
      }).open();
    } else {
      alert("주소 검색 스크립트를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <Layout>
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />
      <div className={view.page}>
        <PageHeader title="마이페이지" description="내 정보와 비밀번호를 변경합니다"></PageHeader>
        <div className={styles.content}>
          <form className={view.accountForm}>
            <h3 className={styles.subTitle}>내 정보 수정</h3>
            <div className={styles.inputGroup}>
              <UI.Mt1>
                <UI.Label>직급</UI.Label>
                <UI.Input
                  type="text"
                  required
                />
              </UI.Mt1>
              <UI.Mt1>
                <UI.Label>전화번호</UI.Label>
                <UI.Input
                  type="text"
                  required
                />
              </UI.Mt1>
            </div>
            <UI.Mt1>
              <UI.Label>주소</UI.Label>
              <div className={styles.address}>
                <UI.Input
                  type="text"
                  readOnly
                />
                <Button type="button" variant="outline" onClick={handleAddressSearch}>주소 검색</Button>
              </div>
            </UI.Mt1>
            <UI.Mt1>
              <UI.Label>상세주소</UI.Label>
              <UI.Input
                type="text"
                required
              />
            </UI.Mt1>
            <UI.BtnWrap>
              <UI.Button type="submit" variant="primary">내 정보 수정</UI.Button>
            </UI.BtnWrap>
          </form>
          <form onSubmit={handleChangePassword} className={view.accountForm}>
            <h3 className={styles.subTitle}>비밀번호 변경</h3>
            <UI.Mt1>
              <UI.Label>기존 비밀번호</UI.Label>
              <UI.Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </UI.Mt1>
            <UI.Mt1>
              <UI.Label>새 비밀번호</UI.Label>
              <UI.Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </UI.Mt1>
            <UI.Mt1>
              <UI.Label>새 비밀번호 확인</UI.Label>
              <UI.Input
                type="password"
                value={newPasswordRepeat}
                onChange={(e) => setNewPasswordRepeat(e.target.value)}
                required
              />
            </UI.Mt1>
            <UI.BtnWrap>
              <UI.Button type="submit" variant="primary">비밀번호 변경하기</UI.Button>
            </UI.BtnWrap>
          </form>
        </div>
      </div>
    </Layout>
  );
}