import RN, { NativeModules, DeviceEventEmitter } from 'react-native';
import { EventEmitter } from 'events'
EventEmitter.defaultMaxListeners = Infinity;

let RNLanScan = NativeModules.RNLanScan;

export class LanScan extends EventEmitter {

    static listenerCount = 0;

    _connectedHosts;
    _availableHosts;

    constructor(props) {
        super(props);

        this._connectedHosts = [];
        this._availableHosts = {};

        if(LanScan.listenerCount && LanScan.listenerCount > 0) {
            DeviceEventEmitter.removeAllListeners('RNLanScanStart');
            DeviceEventEmitter.removeAllListeners('RNLanScanStop');
            DeviceEventEmitter.removeAllListeners('RNLanScanStartFetch');
            DeviceEventEmitter.removeAllListeners('RNLanScanInfoFetched');
            DeviceEventEmitter.removeAllListeners('RNLanScanFetchError');
            DeviceEventEmitter.removeAllListeners('RNLanScanStartPings');
            DeviceEventEmitter.removeAllListeners('RNLanScanHostFoundPing');
            DeviceEventEmitter.removeAllListeners('RNLanScanEndPings');
            DeviceEventEmitter.removeAllListeners('RNLanScanPortOutOfRangeError');
            DeviceEventEmitter.removeAllListeners('RNLanScanStartBroadcast');
            DeviceEventEmitter.removeAllListeners('RNLanScanHostFound');
            DeviceEventEmitter.removeAllListeners('RNLanScanEndBroadcast');
            DeviceEventEmitter.removeAllListeners('RNLanScanEnd');
            DeviceEventEmitter.removeAllListeners('RNLanScanError');

            LanScan.listenerCount = 0;
        }

        if(LanScan.listenerCount === 0) {

            DeviceEventEmitter.addListener('RNLanScanStart', () => this.emit('start'));
            DeviceEventEmitter.addListener('RNLanScanStop', () => this.emit('stop'));
            DeviceEventEmitter.addListener('RNLanScanStartFetch', () => this.emit('start_fetch'));
            DeviceEventEmitter.addListener('RNLanScanInfoFetched', (info) => {
                if(!info || !info.ipAddress || !info.netmask) {
                    this.emit('fetch_error', "No Info fetched from the device wifi state");
                    return false;
                }

                this.emit('info_fetched', info);
            });
            DeviceEventEmitter.addListener('RNLanScanFetchError', (msg) => this.emit('fetch_error', msg));
            DeviceEventEmitter.addListener('RNLanScanStartPings', () => this.emit('start_pings'));
            DeviceEventEmitter.addListener('RNLanScanHostFoundPing', (host) => {

                if(!host)
                    return false;

                this._connectedHosts = [...this._connectedHosts, host];

                this.emit('host_found_ping', host, this._connectedHosts);
            });
            DeviceEventEmitter.addListener('RNLanScanEndPings', (number) => {

                if(number === null)
                    return false;

                this.emit('end_pings', number);
            });
            DeviceEventEmitter.addListener('RNLanScanPortOutOfRangeError', (msg) => this.emit('port_out_of_range_error', msg));
            DeviceEventEmitter.addListener('RNLanScanStartBroadcast', () => this.emit('start_broadcast'));
            DeviceEventEmitter.addListener('RNLanScanHostFound', (host) => {

                if(!host || !host.host || typeof host.host != "string" || host.port === null)
                    return false;

                if(this._availableHosts.hasOwnProperty(host.host)) {
                    if(this._availableHosts[host.host].indexOf(host.port) == -1) {
                        this._availableHosts[host.host].push(host.port);
                    }
                } else {
                    this._availableHosts[host.host] = [host.port];
                }

                this.emit('host_found', host, this._availableHosts);
            });
            DeviceEventEmitter.addListener('RNLanScanEndBroadcast', () => this.emit('end_broadcast'));
            DeviceEventEmitter.addListener('RNLanScanEnd', () => this.emit('end'));
            DeviceEventEmitter.addListener('RNLanScanError', (msg) => this.emit('error', msg));

        }


    }

    scan(min_port, max_port, broadcast_timeout = 500, fallback = true, ping_ms = 50, port_ms = 500) {
        RNLanScan.scan(min_port, max_port, broadcast_timeout, fallback, ping_ms, port_ms);
    }

    stop() {
        RNLanScan.stop();
    }

    fetchInfo() {
        RNLanScan.fetchInfo();
    }

    getConnectedHosts() {
        return this._connectedHosts;
    }

    getAvailableHosts() {
        return this._availableHosts;
    }



}