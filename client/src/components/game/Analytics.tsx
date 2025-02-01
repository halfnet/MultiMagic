
import { useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { useCookieAuth } from '@/hooks/use-cookie-auth';

interface GamesData {
  day: string;
  easy_count: number;
  hard_count: number;
  practice_count: number;
}

interface ResponseTimeData {
  week_start: string;
  difficulty: string;
  avg_time_seconds: number;
}

interface User {
  id: number;
  username: string;
}

export function Analytics() {
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useCookieAuth();
  const [selectedUser, setSelectedUser] = useState<string>(user?.id.toString() || 'all');
  const [gamesData, setGamesData] = useState<GamesData[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<ResponseTimeData[]>([]);
  const [slowestNumbers, setSlowestNumbers] = useState<Array<{
    difficulty: string;
    number: number;
    avg_time_ms: number;
  }>>([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers);
  }, []);

  useEffect(() => {
    const userId = selectedUser === 'all' ? undefined : selectedUser;
    fetch(`/api/analytics/games-by-day${userId ? `?userId=${userId}` : ''}`)
      .then(res => res.json())
      .then(setGamesData);

    fetch(`/api/analytics/response-times${userId ? `?userId=${userId}` : ''}`)
      .then(res => res.json())
      .then(setResponseTimeData);

    fetch(`/api/analytics/slowest-numbers${userId ? `?userId=${userId}` : ''}`)
      .then(res => res.json())
      .then(setSlowestNumbers);
  }, [selectedUser]);

  const responseTimeLineData = ['easy', 'hard'].map(difficulty => ({
    id: difficulty === 'easy' ? 'Easy Mode' : 'Hard Mode',
    data: (responseTimeData || [])
      .filter(d => d?.difficulty === difficulty)
      .map(d => ({
        x: d?.week_start ? new Date(d.week_start).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }) : '',
        y: d?.avg_time_seconds || 0
      }))
      .filter(d => d.x)
  }));

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Label>Filter by User:</Label>
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Games Played (Last 7 Days)</h3>
        <div className="h-[280px]">
          <ResponsiveBar
            data={gamesData}
            keys={['easy_count', 'hard_count', 'practice_count']}
            indexBy="day"
            margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={['#4ade80', '#f43f5e', '#a855f7']}
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickRotation: -45,
              format: (value) => new Date(value).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'top',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: -40,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Time To Answer (Last 8 Weeks)</h3>
        <div className="h-[280px]">
          <ResponsiveLine
            data={responseTimeLineData}
            margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickRotation: -45,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Time (seconds)',
              legendOffset: -40,
              legendPosition: 'middle'
            }}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            useMesh={true}
            legends={[
              {
                anchor: 'top',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: -40,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemBackground: 'rgba(0, 0, 0, .03)',
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Hardest Numbers</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left">Mode</th>
                <th className="py-2 px-4 text-left">Number</th>
                <th className="py-2 px-4 text-left">Average Time (seconds)</th>
              </tr>
            </thead>
            <tbody>
              {slowestNumbers.map((entry, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 px-4">
                    {entry.difficulty === 'easy' ? 'Easy Mode' : 'Hard Mode'}
                  </td>
                  <td className="py-2 px-4">{entry.number}</td>
                  <td className="py-2 px-4">
                    {(entry.avg_time_ms / 1000).toFixed(1)}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
