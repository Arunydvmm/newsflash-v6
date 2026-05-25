import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const HealthTrendArticle = () => {
  const [activeTab, setActiveTab] = useState('diseases');

  // Disease Prevalence
  const diseaseData = [
    { name: 'Cardiovascular', value: 32, color: '#D85A30' },
    { name: 'Diabetes', value: 24, color: '#D85A30' },
    { name: 'Respiratory', value: 18, color: '#185FA5' },
    { name: 'Mental Health', value: 16, color: '#0F6E56' },
    { name: 'Others', value: 10, color: '#888780' }
  ];

  // Annual Growth Trend
  const healthTrendData = [
    { year: '2021', cases: 45, recoveryRate: 78, hospitalizations: 18 },
    { year: '2022', cases: 52, recoveryRate: 82, hospitalizations: 16 },
    { year: '2023', cases: 58, recoveryRate: 85, hospitalizations: 14 },
    { year: '2024', cases: 63, recoveryRate: 88, hospitalizations: 12 },
    { year: '2025', cases: 67, recoveryRate: 90, hospitalizations: 10 }
  ];

  // Regional Breakdown
  const regionalData = [
    { region: 'North', cases: 12.5, population: 32, rate: 39.1 },
    { region: 'South', cases: 18.3, population: 40, rate: 45.8 },
    { region: 'East', cases: 14.2, population: 28, rate: 50.7 },
    { region: 'West', cases: 16.8, population: 35, rate: 48.0 },
    { region: 'Central', cases: 10.2, population: 20, rate: 51.0 }
  ];

  // Age Group Distribution
  const ageGroupData = [
    { group: '0-18', prevalence: 8, color: '#185FA5' },
    { group: '19-35', prevalence: 15, color: '#639922' },
    { group: '36-50', prevalence: 28, color: '#D85A30' },
    { group: '51-65', prevalence: 35, color: '#D85A30' },
    { group: '65+', prevalence: 40, color: '#8B0000' }
  ];

  // Key Metrics
  const metrics = [
    { label: 'Total Cases', value: '67M', subtitle: 'Reported (2025)', color: '#D85A30' },
    { label: 'Recovery Rate', value: '90%', subtitle: 'Up from 78% in 2021', color: '#639922' },
    { label: 'Hospitalizations', value: '10%', subtitle: 'Significant decline', color: '#185FA5' },
    { label: 'Prevention Success', value: '43%', subtitle: 'Through awareness', color: '#0F6E56' }
  ];

  const insights = [
    {
      icon: '📈',
      title: 'Lifestyle Changes Impact',
      description: '43% improvement in disease prevention through increased awareness. Digital health monitoring adoption reached 68% in urban areas.',
      color: '#EAF3DE'
    },
    {
      icon: '💊',
      title: 'Treatment Advances',
      description: '90% recovery rate in 2025, up from 78% in 2021. New treatment protocols and early detection improving outcomes.',
      color: '#E6F1FB'
    },
    {
      icon: '👥',
      title: 'Age Group Patterns',
      description: 'Prevalence increases with age. 40% of 65+ population affected. Youth awareness programs showing positive impact.',
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
          Health & Wellness
        </span>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '600',
          margin: '0 0 8px',
          color: '#1a1a1a'
        }}>
          India's Health Report 2025: 90% Recovery Rate & Prevention Success
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#666',
          margin: '0'
        }}>
          By admin • May 23, 2026 • 9 min read
        </p>
      </div>

      {/* Metrics Grid */}
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
          { key: 'diseases', label: 'Disease Breakdown' },
          { key: 'trends', label: '5-Year Trend' },
          { key: 'regional', label: 'Regional Data' },
          { key: 'agegroup', label: 'Age Analysis' }
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
      {activeTab === 'diseases' && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 16px',
            color: '#1a1a1a'
          }}>
            Disease Prevalence Distribution (2025)
          </h2>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e0e0e0'
          }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={diseaseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {diseaseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginTop: '16px'
          }}>
            {diseaseData.map((disease, idx) => (
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
                  marginBottom: '6px'
                }}>
                  <span style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: disease.color,
                    borderRadius: '2px'
                  }}></span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {disease.name}
                  </span>
                </div>
                <p style={{
                  fontSize: '12px',
                  color: '#666',
                  margin: '0'
                }}>
                  {disease.value}% of total cases
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 16px',
            color: '#1a1a1a'
          }}>
            5-Year Health Trend (2021-2025)
          </h2>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e0e0e0'
          }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={healthTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="recoveryRate" stroke="#639922" name="Recovery Rate %" strokeWidth={2} />
                <Line type="monotone" dataKey="hospitalizations" stroke="#185FA5" name="Hospitalizations %" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginTop: '16px'
          }}>
            <div style={{
              backgroundColor: '#EAF3DE',
              padding: '12px',
              borderRadius: '8px'
            }}>
              <p style={{
                fontSize: '13px',
                fontWeight: '600',
                margin: '0 0 4px',
                color: '#639922'
              }}>
                Recovery Rate Improvement
              </p>
              <p style={{
                fontSize: '12px',
                color: '#555',
                margin: '0'
              }}>
                78% (2021) → 90% (2025) | +12 percentage points
              </p>
            </div>
            <div style={{
              backgroundColor: '#E6F1FB',
              padding: '12px',
              borderRadius: '8px'
            }}>
              <p style={{
                fontSize: '13px',
                fontWeight: '600',
                margin: '0 0 4px',
                color: '#185FA5'
              }}>
                Hospital Pressure Relief
              </p>
              <p style={{
                fontSize: '12px',
                color: '#555',
                margin: '0'
              }}>
                18% (2021) → 10% (2025) | -8 percentage points
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'regional' && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 16px',
            color: '#1a1a1a'
          }}>
            Regional Case Distribution
          </h2>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e0e0e0'
          }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cases" fill="#D85A30" name="Cases (Millions)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
            marginTop: '16px'
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
                  }}>Region</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#666'
                  }}>Cases (M)</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#666'
                  }}>Rate per 100K</th>
                </tr>
              </thead>
              <tbody>
                {regionalData.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: idx !== regionalData.length - 1 ? '1px solid #e0e0e0' : 'none',
                      backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff'
                    }}
                  >
                    <td style={{
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      {row.region}
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '13px'
                    }}>
                      {row.cases}
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '13px',
                      color: '#D85A30'
                    }}>
                      {row.rate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'agegroup' && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 16px',
            color: '#1a1a1a'
          }}>
            Age Group Prevalence Analysis
          </h2>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e0e0e0'
          }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageGroupData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" />
                <YAxis dataKey="group" type="category" />
                <Tooltip />
                <Bar dataKey="prevalence" fill="#D85A30" name="Prevalence %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{
            backgroundColor: '#FFF4E6',
            padding: '16px',
            borderRadius: '8px',
            marginTop: '16px',
            borderLeft: '4px solid #D85A30'
          }}>
            <p style={{
              fontSize: '13px',
              fontWeight: '600',
              margin: '0 0 4px'
            }}>
              Age Pattern Insight
            </p>
            <p style={{
              fontSize: '12px',
              color: '#555',
              margin: '0'
            }}>
              Prevalence significantly increases with age. 65+ age group shows 40% prevalence compared to 8% in 0-18 age group. Urgent focus needed on elderly care programs.
            </p>
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
        Key Health Insights
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
          🏥 Data source: Ministry of Health & Family Welfare, WHO | Last updated: May 23, 2026
        </p>
      </div>
    </div>
  );
};

export default HealthTrendArticle;