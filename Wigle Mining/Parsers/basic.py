import sys
import csv

#time, ?, ?, ?, ?, type, mac, name
#1410992732,Radio,181,2462,1152,Beacn,00:12:0e:85:70:58,Jane's Wireless

names = set()
devices = {}
routers = {}
with open(sys.argv[1], 'rb') as f:
    reader = csv.reader(f, delimiter=',')
    for row in reader:
        if len(row) > 6:
            time = row[0]
            typ = row[5]
            mac = row[6]
            name = row[7]
            if typ == 'Probe' and name != 'BROADCAST':
                
                names.add(name)
                if mac in devices:
                    # print devices[mac]
                    devices[mac].add(name)
                    if name in devices[mac] :
                        # print name + " is duplicate"
                        pass
                    else:
                        print name

                else:
                    devices[mac] = set()
                    devices[mac].add(name)
            


for name in names:
    print name

names_count = {}

for mac in devices.keys():
    for name in devices[mac]:
        if name in names_count:
            names_count[name] += 1
        else:
            names_count[name] = 1

    #prints mac address
#    output = mac + ': ' + ', '.join(devices[mac])
#    print output


#print names_count

## prints the unique names
#for w in sorted(names_count, key=names_count.get, reverse=True):
#    print w + ': ' + str(names_count[w])
