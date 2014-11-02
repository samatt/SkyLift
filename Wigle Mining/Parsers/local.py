
from datetime import datetime, date, time, timedelta


vendorNames = dict()
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


def getVendor(mac):
    mac = mac.split(":")
    vid = mac[0]+":"+mac[1]+":"+mac[2]
    vid = vid.upper()
    
    if vid in vendorNames.keys():
        return vendorNames[vid]
    else:
        return "Unknown"


def addRouter(params):
    cur_tz = datetime.utcfromtimestamp(int(params[TIMESTAMP]))
    cur_tz = str(cur_tz)
    node = dict()
    node['kind']="Router"
    node['bssid']=params[BEACON_AP_BSSID]
    node['essid']=params[BEACON_AP_ESSID]
    node['created_at'] = str(datetime.now())
    node['last'] = cur_tz
    node['timestamp'] = int(params[TIMESTAMP])
    node['power'] = int(params[RADIO_SIGNAL_STRENGTH])
    node['vendor'] = getVendor(params[BEACON_AP_BSSID])
    return node

def addClient(params):
    cur_tz = datetime.utcfromtimestamp(int(params[TIMESTAMP]))
    cur_tz = str(cur_tz);
    # print type(datetime.now())
    # _probes = set()
    node = dict()
    if params[PACKET_TYPE] == "Probe":
        
        node['kind']= "Client"
        node['bssid']= params[PROBE_ST_BSSID]
        node['essid']="NA"
        node['first' ]= cur_tz
        node['last' ]= cur_tz
        node['power' ]= int(params[RADIO_SIGNAL_STRENGTH])
        node['timestamp' ]= int(params[TIMESTAMP])
        node['probes'] =list()
        if(params[PROBE_PROBED_ESSID] != "BROADCAST"):
            name = params[PROBE_PROBED_ESSID]
            node['probes'].append(name)
        node['ap_essid' ]= ""
        node['vendor'] = getVendor(params[PROBE_ST_BSSID])
        return node
    #NOTE: The signal strenght we're picking up from this packet is coming from the router not the client/station
    elif params[PACKET_TYPE] == "Data":
        
        node['kind']="Client"
        node['bssid']= params[DATA_ST_BSSID]
        node['essid']="NA"
        node['first']= cur_tz
        node['last']= cur_tz
        node['timestamp']= int(params[TIMESTAMP])
        node['power']= int(params[RADIO_SIGNAL_STRENGTH])
        node['probes'] =list()
        node['ap_essid']= params[DATA_AP_BSSID]
        node['vendor'] = getVendor(params[DATA_ST_BSSID])
        return node
        # clientMap[node['bssid']] = node['_id']
        # print node

    
    

def updateRouter(cur,params):
    node = cur
    cur_tz = datetime.utcfromtimestamp(int(params[TIMESTAMP]))
    cur_tz = str(cur_tz);
    node['power'] =  int(params[RADIO_SIGNAL_STRENGTH])
    node['last'] = str(cur_tz)
    node['timestamp'] = int(params[TIMESTAMP])
    node['essid'] = params[BEACON_AP_ESSID]
    return node
    # db.save_doc(node)

def updateClient(cur,params):
    node = cur

    cur_tz = datetime.utcfromtimestamp(int(params[TIMESTAMP]))
    node['last'] = str(cur_tz)
    node['timestamp'] = int(params[TIMESTAMP])

    if params[PACKET_TYPE] == "Probe":
        
        if params[PROBE_PROBED_ESSID] != "BROADCAST":

            if len(node['probes']) <= 0:
                # node['probes'] = set()
                node['probes'] = [params[PROBE_PROBED_ESSID]]
                power = int(params[RADIO_SIGNAL_STRENGTH])
                # print node['probes']

            elif params[PROBE_PROBED_ESSID] not in node['probes'] :
            
                node['probes'].append(params[PROBE_PROBED_ESSID])
                power = int(params[RADIO_SIGNAL_STRENGTH])

    elif params[PACKET_TYPE] == "Data":
        node['ap_essid'] = params[DATA_AP_BSSID]
    node['power'] =  int(params[RADIO_SIGNAL_STRENGTH])
    return node
