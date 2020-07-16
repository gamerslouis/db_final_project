import csv
import code
import sqlite3

with open('data/TaiwanSpecies20200427_UTF8.csv', newline='') as csvfile:
    # 讀取 CSV 檔案內容
    rows = list(csv.reader(csvfile))[1:]

rows = list(filter(lambda r: r[0] == 'Animalia', rows))
species = []
levels = [[] for _ in range(6)]
pids = [[] for _ in range(7)]
pids[0] = [0 for _ in range(len(rows))]
finished = [{} for _ in range(6)]

for row in rows:
    levels[0].append((row[0], row[1]))
    levels[1].append((row[2], row[3]))
    levels[2].append((row[4], row[5]))
    levels[3].append((row[6], row[7]))
    levels[4].append((row[8], row[9]))
    levels[5].append((row[12], row[13]))
    species.append((row[11], row[29], row[25]))

conn = sqlite3.connect('db.sqlite3')
cur = conn.cursor()
for i in range(6):
    for j in range(len(rows)):
        if levels[i][j][0] in finished[i]:
            pids[i+1].append(finished[i][levels[i][j][0]])
            continue
        cur.execute('INSERT INTO SpeciesTaxonomy (level, name, chinese_name, parent) VALUES (?,?,?,?)', (i, levels[i][j][0], levels[i][j][1], pids[i][j]))
        lid = cur.lastrowid
        pids[i+1].append(lid)
        finished[i][levels[i][j][0]] = lid

for i in range(len(rows)):
    cur.execute('INSERT INTO Species (scientific_name, common_name, taxonomy,is_endemic) VALUES (?,?,?,?)', (species[i][0], species[i][1], pids[6][i], species[i][2]))


conn.commit()

# code.interact(local=locals())
