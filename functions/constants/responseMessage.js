module.exports = {
  NULL_VALUE: '필요한 값이 없습니다',
  OUT_OF_VALUE: '파라미터 값이 잘못되었습니다',
  WRONG_FILTER: '필터 값이 잘못되었습니다',

  // 회원가입
  CREATED_USER: '회원 가입 성공',
  DELETE_USER: '회원 탈퇴 성공',
  ALREADY_EMAIL: '이미 가입된 이메일입니다.',

  // 로그인
  LOGIN_SUCCESS: '로그인 성공',
  LOGOUT_SUCCESS: '로그아웃 성공',
  LOGIN_FAIL: '로그인 실패',
  NO_USER: '존재하지 않는 회원입니다.',
  MISS_MATCH_USER: '유저가 맞지 않습니다.',
  MISS_MATCH_PW: '비밀번호가 맞지 않습니다.',
  INVALID_EMAIL: '이메일 형식을 확인해주세요.',

  // 프로필 조회
  READ_PROFILE_SUCCESS: '프로필 조회 성공',

  // 유저
  READ_ONE_USER_SUCCESS: '유저 조회 성공',
  READ_ALL_USERS_SUCCESS: '모든 유저 조회 성공',
  UPDATE_ONE_USER_SUCCESS: '유저 수정 성공',
  DELETE_ONE_USER_SUCCESS: '유저 삭제 성공',

  // 포스트
  ADD_ONE_POST_SUCCESS: '포스트 추가 성공',
  READ_ONE_POST_SUCCESS: '포스트 조회 성공',
  READ_ALL_POSTS_SUCCESS: '모든 포스트 조회 성공',
  UPDATE_ONE_POST_SUCCESS: '포스트 수정 성공',
  DELETE_ONE_POST_SUCCESS: '포스트 삭제 성공',
  NO_POST: '존재하지 않는 포스트입니다.',

  // 모델 웨이트
  ADD_ONE_WEIGHT_SUCCESS: '모델 웨이트 업로드 성공',
  UPDATE_ONE_WEIGHT_SUCCESS: '모델 웨이트 수정 성공',
  NO_WEIGHT: '모델 웨이트가 없습니다.',
  WRONG_WEIGHT_UUID: '모델 웨이트 UUID가 잘못되었습니다.',

  // 모델 인퍼런스
  ADD_ONE_INFERENCE_SUCCESS: '모델 인퍼런스 성공',
  READ_ALL_INFERENCES_SUCCESS: '모든 모델 인퍼런스 조회 성공',

  // 태그
  ADD_ONE_TAG_FAIL: '태그 추가 실패',
  TAG_COUNT_FAIL: '태그는 10개까지 추가할 수 있습니다.',
  DELETE_RELATION_POST_TAG_FAIL: '포스트 태그 릴레이션 삭제 실패',

  // 서버 내 오류
  INTERNAL_SERVER_ERROR: '서버 내 오류',

  // 토큰
  TOKEN_EXPIRED: '토큰이 만료되었습니다.',
  TOKEN_INVALID: '토큰이 유효하지 않습니다.',
  TOKEN_EMPTY: '토큰이 없습니다.',

  // 인증
  NO_AUTH_HEADER: 'Authorization 헤더가 없습니다.',
  AVAILABLE_EMAIL: '사용 가능한 이메일입니다.',
  AVAILABLE_NICKNAME: '사용 가능한 닉네임입니다.',
  AVAILABLE_PHONE: '사용 가능한 번호입니다.',
  FORBIDDEN: '권한이 없습니다.',

  // 구독
  UPDATE_ONE_SUBSCRIBE_SUCCESS: '구독 업데이트 성공',

  // 결제
  READ_ALL_PAYMENTS_SUCCESS: '모든 결제 내역 조회 성공',
  READ_ONE_PAYMENT_SUCCESS: '결제 조회 성공',
  PAYMENT_FAIL: '결제 실패',
};
