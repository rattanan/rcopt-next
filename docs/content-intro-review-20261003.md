# Article intro review — 2026-10-03

Reviewed 415 published, non-news articles. Prepared 189 short AI-written intros: 185 duplicate/near-duplicate intros and 4 missing intros with sufficient source text. Titles and article bodies are unchanged. Summaries describe the supplied content; they do not add treatment recommendations or claim that old announcements remain current.

Detection compared normalized text, exact containment, and character 4-gram overlap (82% threshold), followed by content review. The replacement file is `scripts/data/article-intros-20261003.json`. Each row includes a source hash.

## Apply and recover

Run `node --env-file=.env scripts/update-article-intros.mjs` for a read-only validation, then add `--apply` to apply. The script locks and checks all source rows, writes a timestamped backup under `.runtime/backups/`, then updates intro and last-modified time in one transaction. Re-running skips already-applied summaries. A changed source aborts the entire run. Backups retain the previous intro, date, title, body, and replacement text for guarded restoration.

## Insufficient source text

The following 22 items contain no substantive body text (some have media or obsolete embed markup). Six have duplicate short placeholders; sixteen have missing intros. These were left unchanged because a content summary would require reading the referenced media or recovering the original text.

| ID | Title | Reason |
|---|---|---|
| 711 | ข้อบังคับแพทยสภา ว่าด้วยราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย ปี ๒๕๔๙ | identical |
| 716 | ปัญหาทางกฎหมายและการปฏิบัติตาม พรบ.หลักประกันสุขภาพแห่งชาติ | identical |
| 718 | บทความน่ารู้เกี่ยวกับ Retinaเช่น ปัจจัยเสี่ยงในการเกิด CSR,CRVO ในผู้ป่วยอายุน้อย.............อ่านต่อ>>> | identical |
| 1237 | My Life Style | identical |
| 1242 | Color Vision | missing |
| 1243 | Foreign body removal | missing |
| 1244 | Hertel exophthalmometer | missing |
| 1245 | Lacrimal sac irrigation | missing |
| 1246 | Schiotz tonometer | missing |
| 1247 | Snellen visual acuity | missing |
| 1248 | การประกอบแว่น | missing |
| 1249 | Incision and drainage | identical |
| 1250 | ความรู้เรื่องตา Contrast Sensitivity | missing |
| 1270 | ผ่าตัดจอประสาทตาลอก | missing |
| 1271 | สโมสรสุขภาพ ปี3 ตอนที่ 1 | missing |
| 1272 | สโมสรสุขภาพ ปี3 ตอนที่ 2 | missing |
| 1427 | Certificate of attendance 35 | identical |
| 1841 | ประกาศ เรื่อง รายละเอียดและเงื่อนไขเกี่ยวกับการสมัครสอบและการสอบ เพื่อหนังสืออนุมัติฯ ปี 63 รอบที่ 2 | missing |
| 1891 | ความรู้วิชาการโควิดกับดวงตาเกี่ยวกับภาวะตาสีฟ้าจากยาต้านไวรัส (สำหรับประชาชน) | missing |
| 1960 | ประกาศ เรื่อง กำหนดกระบวนการรับสมัครและการคัดเลือกแพทย์ประจำบ้าน สาขาจักษุวิทยา ปี 67 รอบที่ 2 | missing |
| 1998 | มาตรฐานคุณวุฒิความรู้ความชำนาญในการประกอบวิชาชีพเวชกรรม สาขาจักษุวิทยา (หลักสูตรปรับปรุง พ.ศ. ๒๕๖๕) | missing |
| 2076 | ประกาศสถาบันที่รับแพทย์เข้ารับการสอบสัมภาษณ์ รอบที่ 1 เพิ่มเติม สาขาจักษุวิทยา ปีการฝึกอบรม 2567 | missing |
