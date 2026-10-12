/** YTH-UP 상담 신청 수신용. 구글 스프레드시트 → 확장 프로그램 → Apps Script */
// 주소창의 docs.google.com/spreadsheets/d/ 와 /edit 사이 값을 입력하세요.
const SHEET_ID = 'PASTE_YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = '상담신청';

function doPost(e) {
  try {
    if (!SHEET_ID || SHEET_ID.includes('PASTE_')) throw new Error('스프레드시트 ID를 설정하세요.');
    const p = e.parameter || {};
    const name = String(p.name || '').trim().slice(0,60);
    const phone = String(p.phone || '').trim().slice(0,20);
    const message = String(p.message || '').trim().slice(0,2000);
    const consent = String(p.consent || '');
    if (!name || !/^(?:0\d{1,2})[- ]?\d{3,4}[- ]?\d{4}$/.test(phone) || !message || consent !== 'YES') {
      throw new Error('필수 정보 누락 또는 형식 오류');
    }
    const ss=SpreadsheetApp.openById(SHEET_ID);
    const sheet=ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    const lock=LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      if(sheet.getLastRow()===0) sheet.appendRow(['신청일시','이름','연락처','문의 내용','개인정보 동의','접수 경로']);
      // 스프레드시트 수식 실행 방지
      const safe = s => /^[=+\-@]/.test(s) ? "'" + s : s;
      sheet.appendRow([new Date(),safe(name),safe(phone),safe(message),'동의','YTH-UP 홈페이지']);
    }finally{lock.releaseLock();}
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    console.error(err);
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err.message)})).setMimeType(ContentService.MimeType.JSON);
  }
}
