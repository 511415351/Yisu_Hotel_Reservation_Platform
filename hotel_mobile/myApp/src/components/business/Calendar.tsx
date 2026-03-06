
import React from 'react'
import { Cell, Calendar, CalendarDay } from '@nutui/nutui-react-taro'

const padZero = (num: number | string, targetLength = 2) => {
  let str = `${num}`
  while (str.length < targetLength) {
    str = `0${str}`
  }
  return str
}

interface CalendarConProps {
  value: { checkInDate: string; checkOutDate: string };               // 必须由父组件传入，格式 { checkInDate, checkOutDate }
  visible: boolean;               // 必须由父组件传入
  onValueChange: (value: { checkInDate: string; checkOutDate: string }) => void;
  onVisibleChange: (visible: boolean) => void;
}

const CalendarCon: React.FC<CalendarConProps> = ({
  value,
  visible,
  onValueChange,
  onVisibleChange
}) => {
  // 计算日历可选范围（仍可保留内部，不依赖外部状态）
  const getCalendarRange = () => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setFullYear(startDate.getFullYear() - 1)
    const endDate = new Date(today)
    endDate.setFullYear(endDate.getFullYear() + 1)
    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = padZero(date.getMonth() + 1)
      const day = padZero(date.getDate())
      return `${year}-${month}-${day}`
    }
    return { startDate: formatDate(startDate), endDate: formatDate(endDate) }
  }

  const calendarRange = getCalendarRange()

  // 禁用特定日期（示例）
  const disableDate = (date: CalendarDay) => {
    return date.day === 25 || date.day === 20 || date.day === 22
  }

  const handleConfirm = (chooseData: any) => {
    const dateArr = { checkInDate: chooseData[0][3], checkOutDate: chooseData[1][3] }
    onValueChange(dateArr)
  }

  const handleClose = () => {
    onVisibleChange(false)
  }

  const handleOpen = () => {
    onVisibleChange(true)
  }

  return (
    <>
      <Cell
        title="日期区间"
        description={
          <div className="desc-box">
            <div className="desc" onClick={handleOpen}>
              {value.checkInDate || '请选择起始时间'}
            </div>
            <div className="desc1">-</div>
            <div className="desc" onClick={handleOpen}>
              {value.checkOutDate || '请选择截止时间'}
            </div>
          </div>
        }
      />
      <Calendar
        visible={visible}
        defaultValue={[value.checkInDate, value.checkOutDate]}                // 直接使用父组件传入的 value
        type="range"
        startDate={calendarRange.startDate}
        endDate={calendarRange.endDate}
        disableDate={disableDate}
        firstDayOfWeek={1}
        onConfirm={handleConfirm}
        onClose={handleClose}
      />
    </>
  )
}

export default CalendarCon