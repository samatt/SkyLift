import sys
import os
import utils
import pprint
import json
import random

routerMap = dict()
clientMap = dict()

def ssid_mac(path):
    
    networks = set()
    networks_output = dict()
    networks_geo = dict() 
    filenames = os.listdir(path)
    
    for f in filenames:
        name = f.split(".")
        networks.add(name[0])
    

        
    for network in networks:
        networks_output[network] = {}
        networks_output[network]['geo'] = {}
        networks_output[network]['ids'] = []
        try:
            geoData = json.load( open( path+"/"+network+".json", "rb" ) )
            if len(geoData['results']) > 0:
                # print network + " has good json"
                # print geoData
                networks_output[network]['geo'] = geoData['results'][0]
            else:
                networks_output[network]['geo'] = {}

        except : 
            pass
        
    for k,v in clientMap.iteritems():
        if 'probes' in v.keys() and v['probes'] is not None:
            if len(v['probes']) > 0:

                for net in v['probes']:
                    if net in networks_output.keys():
                        
                        networks_output[net]['ids'].append(v['bssid'])
                    else:
                        networks_output[net] = {}
                        networks_output[net]['geo'] = {}
                        networks_output[net]['ids'] = [v['bssid']]

    
    # pprint.pprint (networks_output)
    print json.dumps([{'name': k,'geo':v['geo'] ,'ids': v['ids']} for k,v in networks_output.iteritems()],sort_keys=True, indent=4)

def probeList():
    names = set()

    for k,v in clientMap.iteritems():
        if 'probes' in v.keys() and v['probes'] is not None:
            
            for probe in v['probes']:
                if probe is not None:
                    names.add('\''+probe+'\'')
    
    for name in names:
        if name is not None:
            print name

def probeCount():
    names_count = {}
    for k,v in clientMap.iteritems():
        if 'probes' in v.keys() and v['probes'] is not None:
            for probe in v['probes']:
                if probe in names_count.keys():
                    names_count[probe] += 1
                else:
                    names_count[probe] = 1

    # output = mac + ': ' + ', '.join(devices[mac])
    
    for w in sorted(names_count, key=names_count.get, reverse=True):
        print w + ': ' + str(names_count[w])

def routerCount():
    names_count = {}
    for k,v in routerMap.iteritems():
        if v['essid'] in names_count.keys():
            names_count[v['essid']] += 1
        else:
            names_count[v['essid']] = 1

    # output = mac + ': ' + ', '.join(devices[mac])
    
    for w in sorted(names_count, key=names_count.get, reverse=True):
        print w + ': ' + str(names_count[w])

def vendorCount():
    vendorsRouters = {}
    vendorsClients = {}
    for k,v in routerMap.iteritems():
        if v['vendor'] in vendorsRouters.keys():
            vendorsRouters[v['vendor']] += 1
        else:
            vendorsRouters[v['vendor']] = 1

    for k,v in clientMap.iteritems():
        if v['vendor'] in vendorsClients.keys():
            vendorsClients[v['vendor']] += 1
        else:
            vendorsClients[v['vendor']] = 1

    # output = mac + ': ' + ', '.join(devices[mac])
    print "Routers: "
    for w in sorted(vendorsRouters, key=vendorsRouters.get, reverse=True):
        print w + ': ' + str(vendorsRouters[w])

    print '\n' + "Clients: "
    for w in sorted(vendorsClients, key=vendorsClients.get, reverse=True):
        print w + ': ' + str(vendorsClients[w])
def intersect(a, b):
     return list(set(a) & set(b))

def linksBetweenDevices():
    vendorsClients = {}
    history = []
    for k,v in clientMap.iteritems():
        if 'probes' in v.keys() and v['probes'] is not None:
                history.append(v)
                for k1,v1 in clientMap.iteritems():                     
                    if 'probes' in v1.keys() and v1['probes'] is not None:
                        common = intersect(v['probes'],v1['probes'])

                        if v1 in history and v['bssid'] != v1['bssid'] and len(common) > 2:
                            
                            print  str(len(common)) +"  " + " " + v['bssid'] + " - " + v1['bssid'] + " " +  " \n                                          ".join(common) 
                            print "\n"



if __name__ == '__main__' :
    
    if len(sys.argv) >= 2 :

        if sys.argv[1] == 'probes':
            utils.pickleDevices(sys.argv[2])
            routerMap = json.load( open( "../Outputs/routers.json", "rb" ) )
            clientMap = json.load( open( "../Outputs/clients.json", "rb" ) )
            # pprint.pprint(clientMap)
            probeList()
        elif sys.argv[1] == 'networks':
            routerMap = json.load( open( "../Outputs/routers.json", "rb" ) )
            clientMap = json.load( open( "../Outputs/clients.json", "rb" ) )
            ssid_mac(sys.argv[2])

        else:
            print 'Usage: queries.py <mode> <filename>\
                    \n<mode>     : probes or networks\
                    \n<filename> : packets.log or probes.txt'
    else:

        print 'Usage: queries.py <mode> <filename>\
                \n<mode>     : probes or networks\
                \n<filename> : packets.log or (wigle json file path)'

    