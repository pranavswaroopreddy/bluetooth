import RNBluetoothClassic, {
  BluetoothDevice,
} from 'react-native-bluetooth-classic';

export const isBluetoothAvailable = async () => {
  const available = await RNBluetoothClassic.isBluetoothAvailable();
  console.log('available', available);
};

export const isEnabled = async () => {
  const enabled = await RNBluetoothClassic.isEnabled();
  console.log('enabled', enabled);
};

export const requestEnable = async () => {
  const enabled = await RNBluetoothClassic.requestEnable();
  console.log('enabled', enabled);
};

export const getPairedDevices = async () => {
  const devices = await RNBluetoothClassic.getPairedDevices();
  console.log('devices', devices);
};

export const getConnectedDevices = async () => {
  const devices = await RNBluetoothClassic.getConnectedDevices();
  console.log('devices', devices);
};

export const startDiscovery = async () => {
  const unpaired = await RNBluetoothClassic.startDiscovery();
  console.log('started', unpaired);
  return unpaired;
};

export const cancelDiscovery = async () => {
  const cancelled = await RNBluetoothClassic.cancelDiscovery();
  console.log('cancelled', cancelled);
};

export const connect = async () => {
  const device = devices[0];
  const connected = await RNBluetoothClassic.connect(device.id);
  setConnected(connected);
};

export const disconnect = async () => {
  const disconnected = await RNBluetoothClassic.disconnect();
  setConnected(!disconnected);
};

export const write = async () => {
  const written = await RNBluetoothClassic.write('Hello World!');
  console.log('written', written);
};

export const read = async () => {
  const read = await RNBluetoothClassic.read();
  console.log('read', read);
};

export const subscribe = async () => {
  const subscription = await RNBluetoothClassic.subscribe(({data}) => {
    console.log('data', data);
  });
  console.log('subscription', subscription);
};

export const unsubscribe = async () => {
  const unsubscribed = await RNBluetoothClassic.unsubscribe();
  console.log('unsubscribed', unsubscribed);
};

export const enable = async () => {
  const enabled = await RNBluetoothClassic.enable();
  console.log('enabled', enabled);
};

export const disable = async () => {
  const disabled = await RNBluetoothClassic.disable();
  console.log('disabled', disabled);
};

export const discoverUnpairedDevices = async () => {
  const devices = await RNBluetoothClassic.discoverUnpairedDevices();
  console.log('devices', devices);
};

export const discoverUnpairedDevicesWithProgress = async () => {
  const subscription =
    await RNBluetoothClassic.discoverUnpairedDevicesWithProgress(device => {
      console.log('device', device);
    });
  console.log('subscription', subscription);
};

export const isDiscovering = async () => {
  const discovering = await RNBluetoothClassic.isDiscovering();
  console.log('discovering', discovering);
};

export const isConnected = async () => {
  const connected = await RNBluetoothClassic.isConnected();
  console.log('connected', connected);
};
