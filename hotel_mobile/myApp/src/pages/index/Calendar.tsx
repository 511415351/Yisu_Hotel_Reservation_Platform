import React, { useRef, useState, useEffect } from 'react'
import { Cell, Calendar, DatePicker, CalendarDay } from '@nutui/nutui-react-taro'

const padZero = (num: number | string, targetLength = 2) => {
  let str = `${num}`
  while (str.length < targetLength) {
    str = `0${str}`
  }
  return str
}

interface CalendarConProps {
  onChange?: (data: {
    checkInDate: string; // 入住日期，格式：YYYY-MM-DD
    checkInTime: string; // 入住时间，格式：HH:MM:SS
    checkOutDate: string; // 离宿日期，格式：YYYY-MM-DD
    checkOutTime: string; // 离宿时间，格式：HH:MM:SS
  }) => void;
}

const CalendarCon: React.FC<CalendarConProps> = ({ onChange }) => {
   // 获取当前日期和明天的日期
  const getDefaultDates = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = padZero(date.getMonth() + 1)
      const day = padZero(date.getDate())
      return `${year}-${month}-${day}`
    }
    
    return [formatDate(today), formatDate(tomorrow)]
  }

  const [date, setDate] = useState<string[]>(getDefaultDates())
  const [isVisible, setIsVisible] = useState(false)

  const disableDate = (date: CalendarDay) => {
    return date.day === 25 || date.day === 20 || date.day === 22
  }

  const [show, setShow] = useState(false)
  const [dpAbled, setDatePickerAbled] = useState([true, true])
  const [desc1, setDesc1] = useState('10:00:00')
  const [desc2, setDesc2] = useState('20:00:00')
  const desc = useRef(0)
// 计算日历的开始和结束日期
  const getCalendarRange = () => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setFullYear(startDate.getFullYear() - 1) // 可以选择一年前的日期
    
    const endDate = new Date(today)
    endDate.setFullYear(endDate.getFullYear() + 1) // 可以选择一年后的日期
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = padZero(date.getMonth() + 1)
      const day = padZero(date.getDate())
      return `${year}-${month}-${day}`
    }
    
    return { startDate: formatDate(startDate), endDate: formatDate(endDate) }
  }

  const calendarRange = getCalendarRange()
  const setChooseValue = (chooseData: any) => {
    console.log(
      'setChooseValue',
      [...[chooseData[0][3], chooseData[1][3]]],
      chooseData
    )
    const dateArr = [...[chooseData[0][3], chooseData[1][3]]]
    setDate([...dateArr])
  }
  // 当日期或时间变化时，通知父组件
  useEffect(() => {
    if (date && date.length === 2 && onChange) {
      onChange({
        checkInDate: date[0],
        checkInTime: desc1,
        checkOutDate: date[1],
        checkOutTime: desc2,
      })
    }
  }, [date, desc1, desc2, onChange])
  const confirm = (_values: (string | number)[], options: any[]) => {
    if (desc.current === 1) {
      setDesc1(
        options.map((option) => padZero(parseInt(option.text))).join(':')
      )
    } else {
      setDesc2(
        options.map((option) => padZero(parseInt(option.text))).join(':')
      )
    }
  }

  const showDatePicker = (e: any, index: number) => {
    if (dpAbled[index - 1]) {
      e.stopPropagation()
      setShow(true)
      desc.current = index
    }
  }

  const openSwitch = () => {
    setIsVisible(true)
  }

  const closeSwitch = () => {
    setIsVisible(false)
  }

  return (
    <>
      <Cell
        title="日期区间"
        description={
          <div className="desc-box">
            <div className="desc" onClick={openSwitch}>
              {date && date.length ? `${date[0]} ${desc1}` : '请选择起始时间'}
            </div>
            <div className="desc1">-</div>
            <div className="desc" onClick={openSwitch}>
              {date && date.length ? `${date[1]} ${desc2}` : '请选择截止时间'}
            </div>
          </div>
        }
      />
      <Calendar
        visible={isVisible}
        defaultValue={date}
        type="range"
       startDate={calendarRange.startDate}
        endDate={calendarRange.endDate}
        disableDate={disableDate}
        firstDayOfWeek={1}
        onDayClick={(date) => {
          let d = [false, false]
          if (date.length > 1) {
            d = [true, true]
          } else if (date.length > 0) {
            d = [true, false]
          }
          setDatePickerAbled(d)
        }}
        onClose={closeSwitch}
        onConfirm={setChooseValue}
      >
        <div className="nut-calendar-btns">
          <div
            className={`nut-calendar-date ${dpAbled[0] ? '' : 'disabled'}`}
            onClick={(e) => {
              showDatePicker(e, 1)
            }}
          >
            开始时间：{desc1}
          </div>
          -
          <div
            className={`nut-calendar-date ${dpAbled[1] ? '' : 'disabled'}`}
            onClick={(e) => {
              showDatePicker(e, 2)
            }}
          >
            结束时间：{desc2}
          </div>
        </div>
        <DatePicker
          title="时间选择"
          type="time"
          visible={show}
          showChinese
          onClose={() => setShow(false)}
          onConfirm={(options, values) => confirm(values, options)}
        />
      </Calendar>
    </>
  )
}
export default CalendarCon
