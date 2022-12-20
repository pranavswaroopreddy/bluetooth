import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableHighlight,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
  ToastAndroid,
} from 'react-native';
import React from 'react';
import {
  isBluetoothAvailable,
  isEnabled,
  requestEnable,
  getPairedDevices,
  getConnectedDevices,
  startDiscovery,
  cancelDiscovery,
} from './bluetoothHandler';

import {
  requestPermissionFineLocation,
  requestPermissionBluetooth,
  requestPermissionBluetoothAdmin,
  requestPermissionBluetoothConnect,
  requestMultiplePermissions,
} from './permissionHandler';
import DeviceInfo from 'react-native-device-info';
import RNBluetoothClassic, {
  BluetoothDevice,
} from 'react-native-bluetooth-classic';
const Button = ({title, onPress}) => {
  return (
    <TouchableHighlight style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableHighlight>
  );
};

const App = () => {
  const [unPaired, setUnPaired] = React.useState([]);
  const [connected, setConnected] = React.useState();
  const [isDiscovering, setIsDiscovering] = React.useState(false);
  const [paired, setPaired] = React.useState([]);
  const [connectedDevice, setConnectedDevice] = React.useState([]);
  const [message, setMessage] = React.useState('');
  const [active, setActive] = React.useState();
  const [isAccepting, setIsAccepting] = React.useState(false);
  const [device, setDevice] = React.useState();
  const [recievedData, setRecievedData] = React.useState([]);
  const [socketDevices, setSocketDevices] = React.useState([]);

  React.useEffect(() => {
    const apiLevel = DeviceInfo.getApiLevel();
    if (apiLevel < 31) {
      requestPermissionFineLocation();
    } else {
      requestMultiplePermissions();
    }

    getPairedDevices();
  }, []);

  const startDiscovery = async () => {
    setIsDiscovering(true);
    console.log('startDiscovery');
    const granted = await requestPermissionFineLocation();
    if (!granted) {
      console.log('Permission not granted');
      return;
    }
    const unpairedDevices = await RNBluetoothClassic.startDiscovery();

    if (unpairedDevices) {
      console.log('unpaired', unpairedDevices);
      setUnPaired(unpairedDevices);
      setIsDiscovering(false);
    }
  };

  const cancelDiscovery = async () => {
    const cancelled = await RNBluetoothClassic.cancelDiscovery();
    console.log('cancelled', cancelled);
    if (cancelled) {
      console.log('cancelled', cancelled);
      setIsDiscovering(false);
    }
  };

  const pair = async device => {
    const paired = await RNBluetoothClassic.pairDevice(device.id);
    if (paired) {
      console.log('paired', paired);
    }
  };
  const getPairedDevices = async () => {
    const paired = await RNBluetoothClassic.getBondedDevices();
    // console.log('devices', paired);
    setPaired(paired);
  };

  const connectedDevices = async () => {
    const connected = await RNBluetoothClassic.getConnectedDevices();
    console.log('connected', connected);
    setActive(connected);
  };

  const isConnected = async device => {
    try {
      const connected = await device.isConnected();
      if (connected) {
        return true;
      } else return false;
    } catch (error) {
      console.log(error);
    }
  };

  const connect = async device => {
    try {
      // const connected = await RNBluetoothClassic.connect(device.id);
      let connected = await device.isConnected();
      if (!connected) {
        connected = await device.connect({
          CONNECTOR_TYPE: 'rfcomm',
          DELIMITER: '\n',
          DEVICE_CHARSET: Platform.OS === 'ios' ? 1536 : 'utf-8',
        });
      }
      if (connected) {
        console.log('connected', connected);
        setConnected(connected);
        setDevice(device);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const disconnect = async (device, index) => {
    try {
      const disconnected = await device.disconnect();
      setConnected(false);
      if (disconnected) {
        ToastAndroid.show(` Disconnected :${device.name}`, ToastAndroid.SHORT);
        setSocketDevices(socketDevices.filter((item, i) => i !== index));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = async device => {
    try {
      const written = await device.write(message);
      if (written) {
        ToastAndroid.show(` Sent :${message}`, ToastAndroid.SHORT);
        console.log('written', written);
      }
    } catch (error) {
      console.log(error);
      ToastAndroid.show(`${error}`, ToastAndroid.SHORT);
    }
  };

  const time = () => {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  };

  const readMessage = async device => {
    console.log('readMessage');
    try {
      const read = await device.read();
      if (read) {
        console.log('read', read);
        let msg = {
          name: device.name,
          timestamp: time(),
          data: read,
        };
        setRecievedData(prev => {
          return [...prev, msg];
        });
        ToastAndroid.show(` ${device.name} :${read}`, ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log(error);
      ToastAndroid.show(`${error}`, ToastAndroid.SHORT);
    }
  };

  const initializeRead = async () => {
    try {
      console.log('initializeRead', socketDevices[0].id);
      const read = await socketDevices[0].onDataReceived(data => {
        onReceievedData(data);
      });
      // if (read) {
      //   console.log(JSON.stringify(read));
      // }
    } catch (error) {
      console.log(error);
    }
  };

  const onReceievedData = data => {
    let msg = {
      name: data.device.name ? data.device.name : data.device.id,
      timestamp: time(),
      data: data.data,
    };
    setRecievedData(prev => {
      return [...prev, msg];
    });
    // ToastAndroid.show(` ${socketDevices[0].name} :${data}`, ToastAndroid.SHORT);
  };

  React.useEffect(() => {
    console.log('read useeffect');
    if (socketDevices.length > 0) {
      initializeRead();

      // if (read) {
      //   console.log('read', read);
      //   return read();
      // }
    }
  }, [socketDevices]);

  const accept = async () => {
    console.log('accepting');
    setIsAccepting(true);
    try {
      const device = await RNBluetoothClassic.accept({});
      if (device) {
        ToastAndroid.show(` Connected :${device.name}`, ToastAndroid.SHORT);
        cancelAccept();
      }
      setSocketDevices(prev => {
        return [...prev, device];
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsAccepting(false);
      console.log('accepting done');
    }
  };

  const cancelAccept = async () => {
    // if (!isAccepting) {
    //   return;
    // }
    try {
      const cancelled = await RNBluetoothClassic.cancelAccept();
      if (cancelled) {
        console.log('cancelled', cancelled);
        setIsAccepting(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
          <Button title="Start Discovery" onPress={startDiscovery} />
          <Button title="Cancel Discovery" onPress={cancelDiscovery} />
        </View>
        <Text style={styles.title}>Bluetooth Devices</Text>

        {isDiscovering ? (
          <Text style={{alignSelf: 'center'}}>Discovering...</Text>
        ) : (
          <View style={styles.list}>
            <>
              {unPaired.map((device, index) => (
                <Pressable
                  style={styles.device}
                  onPress={() => pair(device)}
                  key={index}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      margin: 5,
                      color: '#fff',
                    }}>
                    {device.name}
                  </Text>
                </Pressable>
              ))}
            </>
          </View>
        )}

        <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
          <Button title="Accept" onPress={accept} />
          <Button title="Cancel Accept" onPress={cancelAccept} />
        </View>

        <Text style={styles.title}>Connected Devices</Text>
        <View style={styles.list}>
          <>
            {socketDevices.map((device, index) => (
              <View
                style={{marginVertical: 5, backgroundColor: '#f4f6f8'}}
                key={index}>
                <Pressable key={index} onPress={() => connect(device)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-evenly',
                    }}>
                    <Text style={styles.listItem}>{device.name}</Text>
                    <Text style={styles.listItem}>{device.id}</Text>
                  </View>
                </Pressable>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                  }}>
                  <Button
                    title="Disconnect"
                    onPress={() => disconnect(device, index)}
                  />
                  <Button
                    title="Send Message"
                    onPress={() => sendMessage(device)}
                  />
                  <Button
                    title="Read Message"
                    onPress={() => readMessage(device)}
                  />
                </View>
              </View>
            ))}
          </>
        </View>
        {/* <View style={{alignItems: 'center'}}>
          <Button title="Get Active Devices" onPress={connectedDevices} />

          <Text style={styles.title}>
            Active{`  ${active && active[0].name}`}
          </Text>
        </View> */}

        <Text style={[styles.title, {marginVertical: 25}]}>Send Data</Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
          }}>
          <TextInput
            style={{
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              width: 300,
              color: '#000',
            }}
            onChangeText={text => setMessage(text)}
            value={message}
          />

          {/* <Button title="Send" onPress={() => sendMessage(message)} /> */}
        </View>
        <Text style={[styles.title, {marginVertical: 25}]}>Revieved Data</Text>
        <View
          style={{
            margin: 10,
            padding: 10,
          }}>
          {recievedData &&
            recievedData.map((msg, index) => (
              <View
                key={index}
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#000',
                  }}>{`${msg.name}:  ${msg.data}`}</Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#000',
                  }}>{` ${msg.timestamp}`}</Text>
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#6750A4',
    padding: 10,
    margin: 10,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: '#6750A4',
  },

  list: {
    // flex: 1,
    flexWrap: 'wrap',
    alignSelf: 'center',

    padding: 10,
  },
  listItem: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 5,
    color: '#000',
  },
  device: {
    backgroundColor: '#6750A4',
    padding: 5,
    margin: 10,
  },
});
