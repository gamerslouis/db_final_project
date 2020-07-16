import requests
import csv
import sys
import code
import sqlite3
import uuid
import shutil
from bs4 import BeautifulSoup as soup
import json

# print(sys.argv)
# exit(0)

with open(sys.argv[1], newline='') as csvfile:
    # 讀取 CSV 檔案內容
    rows = list(csv.reader(csvfile))[1:]

con = sqlite3.connect(sys.argv[2])
cur = con.cursor()
for row in rows:
    tbnid = row[0]
    name = row[6]
    cname = row[7]
    latitude = row[10]
    longitude = row[11]
    pos = row[12]
    date = row[13]
    # import code
    # code.interact(local=locals())
    try:
        cur.execute('select id,common_name from Species where scientific_name = ?', (name,))
        sid, dbname = cur.fetchone()
    except Exception:
        continue

    # try:
    #     import code
    #     code.interact(local=locals())
    #     img = None
    #     res = requests.get('https://www.tbn.org.tw/occurrence/{}', tbnid)
    #     s = soup(res.text, 'html.parser')
    #     img = [i.get('src') for i in s.find_all('img') if i.get('src').startswith('https://www.tbn.org.tw/sites/tbn/files/styles/medium_extend/public/occurrence/media')][0]
    #     res = requests.get(img, stream=True)
    #     file = '/static/media/{}.jpg'.format(str(uuid.uuid4()))
    #     with open(file, 'wb') as f:
    #         shutil.copyfileobj(res.raw, f)
    # except Exception:
    #     file = None
    file = None
    meta = json.dumps({
        'district': pos
    })
    if dbname == 'NULL' and cname != None:
        cur.execute('UPDATE Species set common_name = ? where id = ?', (cname, sid))
    con.execute('INSERT INTO ObservationPoint (' +
                'date, species, latitude, longitude, file, meta_info) VALUES (?,?,?,?,?,?)', (date, sid, float(latitude), float(longitude), file, meta))

con.commit()
con.close()
