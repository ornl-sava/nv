
import json
import copy
import os
import codecs
import urllib2
from BeautifulSoup import BeautifulSoup

#url = "http://www.nessus.org/plugins/index.php?view=single&id=42118" #first test case
#url = "http://www.nessus.org/plugins/index.php?view=single&id=42128" #second test case
#url = "http://www.nessus.org/plugins/index.php?view=single&id=42528" #third test case
#url = "http://www.nessus.org/plugins/index.php?view=single&id=43811" #fourth test case

ids = [10028, 10056, 10079, 10092, 10107, 10114, 10150, 10180, 10203, 10205, 
10223, 10245, 10263, 10267, 10281, 10287, 10342, 10380, 10394, 10395, 10396, 
10397, 10398, 10399, 10400, 10407, 10437, 10456, 10481, 10677, 10719, 10757, 
10785, 10859, 10860, 10863, 10881, 10884, 10897, 10899, 10900, 10902, 10913, 
10915, 10916, 11002, 11011, 11111, 11119, 11153, 11154, 11156, 11213, 11219, 
11255, 11356, 11424, 11429, 11457, 11777, 11819, 11936, 11952, 12053, 12218, 
15588, 15901, 17651, 17975, 18261, 19288, 19506, 20007, 20094, 20390, 20811, 
21078, 21079, 21186, 21643, 21691, 22031, 22032, 22033, 22056, 22189, 22190, 
22227, 22319, 22334, 22531, 22532, 22534, 22535, 22964, 23974, 23998, 23999, 
24260, 24269, 24270, 24272, 24337, 24339, 25162, 25164, 25216, 25220, 25240, 
25687, 25880, 25882, 26024, 26920, 26928, 27524, 27525, 28211, 31046, 31047, 
31413, 31414, 31415, 31705, 32311, 32314, 33133, 33134, 33135, 33137, 33441, 
33872, 33873, 33874, 33875, 33877, 33878, 33879, 33880, 33881, 34096, 34097, 
34120, 34123, 34324, 34402, 34403, 34406, 34408, 34409, 34411, 34414, 34476, 
34741, 34743, 34744, 35070, 35072, 35073, 35075, 35221, 35361, 35362, 35371, 
35634, 35716, 35742, 35822, 35823, 36147, 36149, 36150, 36151, 36152, 36153, 
38153, 38687, 38689, 38742, 39341, 39343, 39344, 39347, 39348, 39350, 39519, 
39520, 39521, 39622, 39791, 39792, 40407, 40434, 40435, 40556, 40557, 40560, 
40561, 40565, 40888, 40889, 40890, 40984, 42088, 42107, 42108, 42110, 42111, 
42112, 42114, 42116, 42118, 42256, 42263, 42411, 42439, 42441, 42873, 43061, 
43063, 43064, 43065, 43068, 43089, 43865, 44045, 44110, 44401, 44414, 44415, 
44416, 44417, 44418, 44421, 44422, 44423, 44425, 45020, 45021, 45378, 45506, 
45507, 45508, 45509, 45510, 45513, 45514, 45516, 45590, 46312, 46313, 46839, 
46840, 46841, 46842, 46843, 46844, 46845, 46846, 46882, 47045, 47556, 47710, 
47712, 47713, 47750, 48216, 48284, 48285, 48286, 48287, 48288, 48289, 48290, 
48291, 48292, 48293, 48294, 48337, 48405, 48761, 48762, 48942, 49219, 49220, 
49221, 49222, 49224, 49225, 49227, 49948, 49950, 49951, 49953, 49955, 49956, 
49957, 49958, 49959, 49960, 49961, 50529, 50845, 51162, 51163, 51168, 51169, 
51170, 51171, 51175, 51177, 51192, 51455, 51587, 51837, 51891, 51903, 51906, 
51907, 51910, 51911, 51912, 51913, 51914, 51926, 51937, 52583, 52585, 52611, 
52703, 53335, 53491, 54615, 55523, 56984, 57041, 57582, 57608, 57792]

debug = False
verbose = False

outFile = './vulnIDs.json'

results = {}

for currID in ids:
  try:
    print "fetching info for vulnID: " + str(currID)
    currResult = {}
    url = "http://www.nessus.org/plugins/index.php?view=single&id=" + str(currID)
    page = urllib2.urlopen(url)

    soup = BeautifulSoup(page)

    title = soup.findAll('h1')[2]

    tbody = title.parent.parent.parent

    #for price in price2:
    #    print price.string

    titleText = title.string
    if debug:
      print titleText
      print ''

    #print tbody

    #for row in tbody.contents:
    #  print row
    #  print '\n'

    #print '////////////////////// ' + str(len(tbody.contents)) + ' items ////////////////////// '

    if (len(tbody.contents) != 25):
      print "WARNING: unexpected length (" + str(len(tbody.contents)) + ')\n'

    family = tbody.contents[len(tbody.contents) -14].findAll('td')[1].contents[0] #'family'
    if debug: print 'family: ' + family + '\n'

    bugtraqList = tbody.contents[len(tbody.contents) -10].findAll('td')[1].findAll('a') #'list of bugtraq links'
    index = 0
    while index < len(bugtraqList):
      bugtraqList[index] = str(bugtraqList[index])
      index += 1
    if debug: print 'bugtraq: ' + str(bugtraqList) + '\n'

    cveList = tbody.contents[len(tbody.contents) -8].findAll('td')[1].findAll('a') #'CVE info'
    index = 0
    while index < len(cveList):
      cveList[index] = str(cveList[index])
      index += 1
    if debug: print 'cve: ' + str(cveList) + '\n'

    descList = tbody.contents[len(tbody.contents) -2].findAll('td')[0].contents #'all description text'
    descListStrings = []
    for item in descList:
      if item != u'\n' and str(item) != u'<br />':
        descListStrings.append(item.replace('\n',''))

    #print all for debugging
    if debug and verbose: print 'desc: ' + str(descListStrings) + '\n'

    index = 1
    synopsis = ''
    for item in descListStrings[index:]:
      index += 1
      if item == u'Description :':
        break
      else:
        synopsis += item + ' '
    if debug: print 'Synopsis: ' + synopsis + '\n'

    description = ''
    for item in descListStrings[index:]:
      index += 1
      if item == u'Solution :' or item == u'Risk factor :' or item == u'Update Information:':
        break
      else:
        description += item + ' '
    if debug: print 'Description: ' + description + '\n'

    updateInfo = ''
    if descListStrings[index-1] == u'Update Information:':
      for item in descListStrings[index:]:
        index += 1
        if item == u'Solution :' or item == u'Risk factor :':
          break
        else:
          updateInfo += item + ' '
      if debug: print 'Update Info: ' + updateInfo + '\n'

    solution = ''
    if descListStrings[index-1] == u'Solution :':
      for item in descListStrings[index:]:
        index += 1
        if item == u'Risk factor :':
          break
        else:
          solution += item + ' '
      if debug: print 'Solution: ' + solution + '\n'

    otherInfo = []
    otherInfo.append(descListStrings[index-1] + ' ' + descListStrings[index])
    index += 1
    for item in descListStrings[index:]:
      if item[0] != '(':
        otherInfo.append(item)
    if debug: print 'otherInfo: ' + str(otherInfo) + '\n'

    currResult['title'] = titleText
    currResult['family'] = family
    currResult['bugtraqList'] = bugtraqList
    currResult['cveList'] = cveList
    currResult['synopsis'] = synopsis
    currResult['description'] = description
    currResult['updateInfo'] = updateInfo
    currResult['solution'] = solution  
    currResult['otherInfoList'] = otherInfo
    results[currID] = currResult
  except:
    print "ERROR occured for vulnID: " + str(currID)
    results[currID] = "ERROR"
  
json.dump(results, codecs.open(outFile, 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True, indent=2)   
