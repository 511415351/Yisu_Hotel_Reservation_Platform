// views/hotel/onChange.tsx 或者 hooks/useHotelFilter.ts
import  type { FormInstance } from 'antd';
import  type { HotelListParams } from '~/types/api';

export const useHotelFilter = (
  form: FormInstance,
  allData: HotelListParams[],
  setDisplayData: (data: HotelListParams[]) => void
) => {
  // 核心过滤逻辑
  const handleFilter = () => {
    const values = form.getFieldsValue();
    const { hotelName, status } = values;

    const filtered = allData.filter((item) => {
      // 酒店名模糊匹配
      const matchName = hotelName
        ? item.hotelName.toLowerCase().includes(hotelName.toLowerCase())
        : true;
      // 状态精准匹配 (注意判断 null/undefined, 因为 0 是有效值)
      const matchStatus = (status !== undefined && status !== null && status !== "")
        ? item.status === status
        : true;

      return matchName && matchStatus;
    });

    setDisplayData(filtered);
  };

  // 当搜索框变化时
  const onSearchChange = (value: string) => {
    form.setFieldsValue({ hotelName: value });
    handleFilter();
  };

  // 当下拉框变化时
  const onStatusChange = (value: number | null) => {
    form.setFieldsValue({ status: value });
    handleFilter();
  };

  // 重置
  const handleReset = () => {
    form.resetFields();
    setDisplayData(allData);
  };

  return {
    onSearchChange,
    onStatusChange,
    handleReset,
    handleFilter,
  };
};
