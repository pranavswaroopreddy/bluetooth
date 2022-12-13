import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableNativeFeedback,
  TouchableHighlight,
  Pressable,
  ScrollView,
  // Button,
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
  const [devices, setDevices] = React.useState([]);
  const [connected, setConnected] = React.useState();
  const [isDiscovering, setIsDiscovering] = React.useState(false);
  const [paired, setPaired] = React.useState([]);
  const [connectedDevice, setConnectedDevice] = React.useState([]);
  const [message, setMessage] = React.useState('');
  const [active, setActive] = React.useState();
  const [isAccepting, setIsAccepting] = React.useState(false);
  const [device, setDevice] = React.useState();

  React.useEffect(() => {
    // requestPermissionFineLocation();
    // requestPermissionBluetooth();
    // requestPermissionBluetoothAdmin();
    // requestPermissionBluetoothConnect();

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
    const unpaired = await RNBluetoothClassic.startDiscovery();

    if (unpaired) {
      console.log('unpaired', unpaired);
      setDevices(unpaired);
      setIsDiscovering(false);
    }
  };

  const cancelDiscovery = async () => {
    const cancelled = cancelDiscovery();
  };

  const pair = async device => {
    const paired = await RNBluetoothClassic.pairDevice(device.id);
    if (paired) {
      console.log('paired', paired);
      // setPaired(paired);
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

  const disconnect = async device => {
    try {
      const disconnected = await device.disconnect();
      setConnected(false);
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
    }
  };

  const readMessage = async device => {
    console.log('readMessage');
    try {
      const read = await device.read();
      if (read) {
        console.log('read', read);
        ToastAndroid.show(` Read :${read}`, ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const accept = async () => {
    console.log('accepting');
    setIsAccepting(true);
    try {
      const device = await RNBluetoothClassic.accept({});
      this.setState({device});
    } catch (error) {
      console.log(error);
    } finally {
      setIsAccepting(false);
      console.log('accepting done');
    }
  };

  const onDataRecieved = data => {};

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
              {devices.map((device, index) => (
                <Pressable
                  style={styles.button}
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

        <Text style={styles.title}>Connected Devices</Text>
        <View style={styles.list}>
          <>
            {paired.map((device, index) => (
              <View View key={index}>
                <Pressable
                  style={{marginVertical: 5, backgroundColor: '#f4f6f8'}}
                  key={index}
                  onPress={() => connect(device)}>
                  <Text style={styles.listItem}>{device.name}</Text>
                  <Text style={styles.listItem}>{device.id}</Text>
                </Pressable>
                {isConnected(device) && (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-evenly',
                    }}>
                    <Button
                      title="Disconnect"
                      onPress={() => disconnect(device)}
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
                )}
              </View>
            ))}
          </>
        </View>
        <View style={{alignItems: 'center'}}>
          <Button title="Get Active Devices" onPress={connectedDevices} />

          <Text style={styles.title}>
            Active{`  ${active && active[0].name}`}
          </Text>
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
          <Button title="Accept" onPress={accept} />
          <Button title="Cancel Accept" onPress={cancelAccept} />
        </View>

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
});
