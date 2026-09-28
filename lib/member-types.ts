// Legacy tbl_profiles_fields.memtype: 1=Registered; 2=Doctor; 3=Honour.
// Zero is the default for profiles without an assigned membership type.
export const memberTypes = [
  { value: 0, label: "ยังไม่ระบุประเภทสมาชิก" },
  { value: 1, label: "สมาชิกทั่วไป" },
  { value: 2, label: "จักษุแพทย์" },
  { value: 3, label: "สมาชิกกิตติมศักดิ์" },
] as const;

export function memberTypeLabel(value: number): string {
  return memberTypes.find((type) => type.value === value)?.label ?? "ประเภทสมาชิกเดิม (ไม่อยู่ในรายการ)";
}
