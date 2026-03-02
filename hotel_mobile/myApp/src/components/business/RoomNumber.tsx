import React, { useState, useEffect } from 'react';
import { View } from '@tarojs/components';
import { InputNumber, Cell, Popup, Button , ConfigProvider} from '@nutui/nutui-react-taro';

interface RoomNumberProps {
  onChange?: (data: {
    roomNum: number;
    adultNum: number;
    childNum: number;
  }) => void;
}
const customTheme = {
    nutuiInputnumberButtonWidth: '24px',
    nutuiInputnumberButtonHeight: '24px',
    nutuiInputnumberButtonBackgroundColor: `#f4f4f4`,
    nutuiInputnumberInputBackgroundColor: '#fff',
    nutuiInputnumberInputMargin: '0 2px',
  }

const RoomNumber: React.FC<RoomNumberProps> = ({ onChange }) => {
    const [visible, setVisible] = useState(false);
    const [values, setValues] = useState({ roomNum: 1, adultNum: 1, childNum: 0 });
    const [tempValues, setTempValues] = useState({ roomNum: 1, adultNum: 1, childNum: 0 });
    
    const openPopup = () => {
        setTempValues({ ...values });
        setVisible(true);
    };
    
    const updateItemValue = (field: string, val: number) => {
        setTempValues(prev => ({
            ...prev,
            [field]: val
        }));
    };
    
    const handleConfirm = () => {
        setValues({ ...tempValues }); // 同步数据
        setVisible(false); 
        console.log('已确认并更新值:', tempValues);
        // 通知父组件数据变化
        if (onChange) {
            onChange({ ...tempValues });
        }
    };

    // 初始化时也通知父组件
    useEffect(() => {
        if (onChange) {
            onChange({ ...values });
        }
    }, []);
  
  return (
    <View className="page">
      {/* 1. 外部显示的 Cell */}
      <Cell
        title="房间|人数"
        extra={`房间数:${values.roomNum} | 成人:${values.adultNum} | 儿童:${values.childNum}`}
        align="center"
        onClick={openPopup}
      />

      {/* 2. 底部弹出层 */}
      <Popup
        visible={visible}
        position="bottom"
        round
        style={{ height: '50%' }}
        onClose={() => setVisible(false)}
      >
        <View style={{ padding: '20px' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>修改数量</h3>
          
          <View>
            <View style={{ marginBottom: '20px' }}>
              <View style={{ marginBottom: '8px', fontSize: '14px' }}>房间数量</View>
              <ConfigProvider theme={customTheme}>
              <InputNumber 
                value={tempValues.roomNum}
                onChange={(val) => updateItemValue('roomNum', Number(val))}
              />
              </ConfigProvider>
            </View>

            <View style={{ marginBottom: '20px' }}>
              <View style={{ marginBottom: '8px', fontSize: '14px' }}>成人数量</View>
             <ConfigProvider theme={customTheme}>
              <InputNumber 
                value={tempValues.adultNum}
                onChange={(val) => updateItemValue('adultNum', Number(val))}
              />
              </ConfigProvider>
            </View>

            <View style={{ marginBottom: '20px' }}>
              <View style={{ marginBottom: '8px', fontSize: '14px' }}>儿童数量</View>
              <ConfigProvider theme={customTheme}>
              <InputNumber 
                defaultValue={0}
                value={tempValues.childNum}
                min={0}
                onChange={(val) => updateItemValue('childNum', Number(val))} 
              />
              </ConfigProvider>
            </View>

            {/* 3. 关闭按钮 */}
            <View style={{ marginTop: '30px' }}>
              <Button 
                block 
                type="primary" 
                onClick={handleConfirm}
              >
                确定
              </Button>
            </View>
          </View>
        </View>
      </Popup>
    </View>
  );
};

export default RoomNumber;
