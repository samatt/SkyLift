import sys
import pickle
import local
import csv
from xml.dom import minidom
import json
import pprint

TIMESTAMP  = 0
RADIO  = 1
RADIO_SIGNAL_STRENGTH = 2
RADIO_FREQUENCY = 3
RADIO_CHANNEL_TYPE = 4
PACKET_TYPE = 5
BEACON_AP_BSSID = 6
BEACON_AP_ESSID = 7
BEACON_CHANNEL = 8
PROBE_ST_BSSID = 6
PROBE_PROBED_ESSID = 7
DATA_ST_BSSID = 6
DATA_AP_BSSID = 7


def pickleVendorMacs():
    vendorNames = dict();
    xmldoc = minidom.parse('vendorMacs.xml')
    itemlist = xmldoc.getElementsByTagName('VendorMapping') 
    print len(itemlist)
    for s in itemlist :
        key = s.attributes['mac_prefix'].value
        value = s.attributes['vendor_name'].value
        vendorNames[key] = value
        print s.attributes['mac_prefix'].value
        print s.attributes['vendor_name'].value

    print vendorNames
    pickle.dump( vendorNames, open( "vendor_names.p", "wb" ) )

def pickleDevices(filename):
    routerMap = dict()
    clientMap = dict()

    local.vendorNames = pickle.load( open( "vendor_names.p", "rb" ) )
    with open(filename, 'r') as f:
        reader = csv.reader(f, delimiter=',')
        for params in reader:
            if len(params) > 6:
                if params[PACKET_TYPE] == "Beacn":
                    if params[BEACON_AP_BSSID] in routerMap.keys():
                        cur = routerMap[params[BEACON_AP_BSSID]]
                        # cur = db.get(routerMap[params[BEACON_AP_BSSID]])
                        routerMap[cur['bssid']] = local.updateRouter(cur,params)
                    else:
                        node = local.addRouter(params)
                        routerMap[node['bssid']] = node
                else:
                    if params[PROBE_ST_BSSID] in clientMap.keys():
                        cur = clientMap[params[PROBE_ST_BSSID]]
                        # cur = db.get(clientMap[params[PROBE_ST_BSSID]])
                        clientMap[cur['bssid']] = local.updateClient(cur,params)
                    else:
                        node = local.addClient(params)
                        clientMap[node['bssid']] = node


    # pickle.dump( routerMap, open( "../Pickled/routers.p", "wb" ) )
    # pickle.dump( clientMap, open( "../Pickled/clients.p", "wb" ) )
    
    with open('../Outputs/clients.json', 'wb') as f:
        json.dump(clientMap, f,sort_keys=True, indent=2)
    with open('../Outputs/routers.json', 'wb') as fp:
        json.dump(routerMap, fp,sort_keys=True, indent=2)

    
    


def randomMAC():
    mac = [ 0x00, 0x16, 0x3e,
        random.randint(0x00, 0x7f),
        random.randint(0x00, 0xff),
        random.randint(0x00, 0xff) ]
    return ':'.join(map(lambda x: "%02x" % x, mac))

if __name__ == '__main__' :

    pickleDevices(sys.argv[1])

