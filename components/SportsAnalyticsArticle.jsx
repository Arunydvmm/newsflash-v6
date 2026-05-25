import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const SportsAnalyticsArticle = () => {
  const [activeTab, setActiveTab] = useState('stats');

  // Match Statistics
  const matchStats = [
    { metric: 'Runs', team1: 287, team2: 235 },
    { metric: 'Wickets', team1: 4, team2: 8 },
    { metric: 'Fours', team1: 18, team2: 12 },
    { metric: 'Sixes', team1: 8, team2: 5 },
    { metric: 'Extras', team1: 12, team2: 18 }
  ];

  // Player Performance
  const playerPerformance = [
    { name: 'Virat Kohli', runs: 95, sr: 148.4, avg: 52.3, color: '#185FA5' },
    { name: 'Rohit Sharma', runs: 87, sr: 135.2, avg: 48.5, color: '#639922' },
    { name: 'Rishabh Pant', runs: 76, sr: 165.2, avg: 44.2, color: '#D85A30' },
    { name: 'Suryakumar', runs: 62, sr: 152.4, avg: 38.1, color: '#0F6E56' }
  ];

  // Tournament Stats
  const tournamentData = [
    { team: 'India', wins: 7, losses: 1, nrr: 1.23 },
    { team: 'Australia', wins: 6, losses: 2, nrr: 0.89 },
    { team: 'Pakistan', wins: 5, losses: 3, nrr: 0.45 },
    { team: 'England', wins: 5, losses: 3, nrr: -0.12 },
    { team: 'South Africa', wins: 4, losses: 4, nrr: -0.67 }
  ];

  // Bowling Analysis
  const bowlingData = [
    { bowler: 'Jasprit Bumrah', wickets: 12, avg: 18.2, econ: 7.2, strike: 15.2 },
    { bowler: 'Hardik Pandya', wickets: 9, avg: 22.3, econ: 8.1, strike: 16.4 },
    { bowler: 'Arshdeep Singh', wickets: 8, avg: 25.1, econ: 8.8, strike: 17.1 }
  ];

  // Player Radar Stats (Kohli Performance)
  const radarData = [
    { category: 'Batting Avg', value: 95 },
    { category: 'Strike Rate', value: 85 },
    { category: 'Consistency', value: 92 },
    { category: 'Power Play', value: 88 },
    { category: 'Death Overs', value: 78 },
    { category: 'Big Matches', value: 90 }
  ];

  const metrics = [
    { label: 'Tournament Wins', value: '7', subtitle: 'Out of 8 matches', color: '#185FA5' },
    { label: 'Net Run Rate', value: '+1.23', subtitle: 'Best in tournament', color: '#639922' },
    { label: 'Top Scorer', value: 'V. Kohli', subtitle: '95 runs (latest)', color: '#D85A30' },
    { label: 'Avg Score', value: '257', subtitle: 'Per innings', color: '#0F6E56' }
  ];

  const insights = [
    {
      icon: '🏏',
      title: 'Kohli's Resurgence',
      description: 'Virat Kohli averaging 52.3 runs with strike rate of 148.4 in the tournament. Key player for India\'s success.',
      color: '#E6F1FB'
    },
    {
      icon: '⚡',
      title: 'Bumrah\'s Dominance',
      description: 'Jasprit Bumrah leading wicket-taker with 12 wickets at economy rate of 7.2. Death overs specialist.',
      color: '#EAF3DE'
    },
    {
      icon: '📊',
      title: 'Strong Batting Lineup',
      description: 'India\'s top 4 averaging 45+ runs each. Balanced batting order providing consistent performances.',
      color: '#FAEEDA'
    }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '24px' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '24px 28px',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <span style={{
          display: 'inline-block',
          backgroundColor: '#E6F1FB',
          color: '#185FA5',
          padding: '4px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          Sports Analytics
        </span>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '600',
          margin: '0 0 8px',
          color: '#1a1a1a'
        }}>
          India Crushes Pakistan: Complete Match Analytics & Performance Breakdown
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#666',
          margin: '0'
        }}>
          By admin • May 23, 2026 • 6 min read
        </p>
      </div>

      {/* Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#f9f9f9',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #e0e0e0'
            }}
          >
            <p style={{
              fontSize: '12px',
              color: '#999',
              margin: '0 0 8px',
              textTransform: 'uppercase',
              fontWeight: '500'
            }}>
              {metric.label}
            </p>
            <p style={{
              fontSize: '24px',
              fontWeight: '600',
              margin: '0',
              color: metric.color
            }}>
              {metric.value}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#999',
              margin: '4px 0 0'
            }}>
              {metric.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid #e0e0e0',
        overflowX: 'auto'
      }}>
        {[
          { key: 'stats', label: 'Match Stats' },
          { key: 'batsmen', label: 'Batsmen Performance' },
          { key: 'bowlers', label: 'Bowling Analysis' },
          { key: 'standings', label: 'Tournament Standing' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: activeTab === tab.key ? '#185FA5' : 'transparent',
              color: activeTab === tab.key ? '#fff' : '#666',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '6px 6px 0 0',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      {activeTab === 'stats' && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 16px',
            color: '#1a1a1a'
          }}>
            Head-to-Head: India 287/4 vs Pakistan 235 (Pakistan batting)
          </h2>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e0e0e0'
          }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={matchStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="team1" fill="#185FA5" name="India" />
                <Bar dataKey="team2" fill="#D85A30" name="Pakistan" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{
            backgroundColor: '#E6F1FB',
            padding: '16px',
            borderRadius: '8px',
            marginTop: '16px',
            borderLeft: '4px solid #185FA5'
          }}>
            <p style={{
              fontSize: '13px',
              fontWeight: '600',
              margin: '0 0 4px'
            }}>
              Match Highlight
            </p>
            <p style={{
              fontSize: '12px',
              color: '#555',
              margin: '0'
            }}>
              India dominated the match with 287 runs, scoring 8 sixes and 18 fours. Pakistan could manage only 235, losing 8 wickets while batting.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'batsmen' && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 16px',
            color: '#1a1a1a'
          }}>
            Top Batsmen Performance
          </h2>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e0e0e0'
          }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={playerPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="runs" fill="#185FA5" name="Runs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginTop: '16px'
          }}>
            {playerPerformance.map((player, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#f9f9f9',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: player.color,
                    borderRadius: '2px'
                  }}></span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {player.name}
                  </span>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  fontSize: '11px',
                  color: '#666'
                }}>
                  <div>
                    <p style={{ margin: '0' }}>Runs: {player.runs}</p>
                    <p style={{ margin: '0' }}>Strike Rate: {player.sr}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0' }}>Avg: {player.avg}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bowlers' && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 16px',
            color: '#1a1a1a'
          }}>
            Bowling Performance (Tournament So Far)
          </h2>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            overflow: 'hidden'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#666'
                  }}>Bowler</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#666'
                  }}>Wickets</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#666'
                  }}>Avg</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#666'
                  }}>Economy</th>
                </tr>
              </thead>
              <tbody>
                {bowlingData.map((bowler, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: idx !== bowlingData.length - 1 ? '1px solid #e0e0e0' : 'none',
                      backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff'
                    }}
                  >
                    <td style={{
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      {bowler.bowler}
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '13px',
                      color: '#185FA5',
                      fontWeight: '600'
                    }}>
                      {bowler.wickets}
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '13px'
                    }}>
                      {bowler.avg}
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '13px'
                    }}>
                      {bowler.econ}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'standings' && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 16px',
            color: '#1a1a1a'
          }}>
            Tournament Standings
          </h2>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            overflow: 'hidden'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#666'
                  }}>Team</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#666'
                  }}>Wins</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#666'
                  }}>Losses</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#666'
                  }}>NRR</th>
                </tr>
              </thead>
              <tbody>
                {tournamentData.map((team, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: idx !== tournamentData.length - 1 ? '1px solid #e0e0e0' : 'none',
                      backgroundColor: idx === 0 ? '#E6F1FB' : idx % 2 === 0 ? '#fafafa' : '#fff'
                    }}
                  >
                    <td style={{
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      {idx === 0 ? '🥇 ' : idx === 1 ? '🥈 ' : idx === 2 ? '🥉 ' : ''} {team.team}
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '13px'
                    }}>
                      {team.wins}
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '13px'
                    }}>
                      {team.losses}
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '13px',
                      color: team.nrr > 0 ? '#639922' : '#D85A30'
                    }}>
                      {team.nrr > 0 ? '+' : ''}{team.nrr}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights */}
      <h2 style={{
        fontSize: '18px',
        fontWeight: '600',
        margin: '32px 0 16px',
        color: '#1a1a1a'
      }}>
        Key Takeaways
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {insights.map((insight, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: insight.color,
              padding: '16px',
              borderRadius: '8px',
              borderLeft: '4px solid #185FA5'
            }}
          >
            <p style={{
              fontSize: '13px',
              fontWeight: '600',
              margin: '0 0 4px'
            }}>
              {insight.icon} {insight.title}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#555',
              margin: '0'
            }}>
              {insight.description}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '16px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '12px',
          color: '#999',
          margin: '0'
        }}>
          🏏 Data source: ICC Cricket Statistics | Last updated: May 23, 2026
        </p>
      </div>
    </div>
  );
};

export default SportsAnalyticsArticle;