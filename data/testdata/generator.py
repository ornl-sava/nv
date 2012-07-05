# ip: data center: 192.168.1.; office: 192.168.2.
# port: 1-1024
# vulnid: 0-100
# vulntype: 'hole', 'note'
# cvss: 0.0-10.0

from random import randrange, uniform
import json

class Entry:
  def __init__(self):
    self.ip = "192.168."+str(randrange(1, 5))+"."+str(randrange(1, 30))
    self.port = randrange(1, 100)
    self.vulnid = randrange(1, 100)
    self.vulntype = 'hole' if randrange(1, 11) > 9 else 'note'
    self.cvss = uniform(1, 11)
    self.value = 1

lines = 25000;

print "["
for i in range(lines):
  if( not i == lines-1 ):
    print json.dumps(vars(Entry()))+","
  else: 
    print json.dumps(vars(Entry()))
print "]"
