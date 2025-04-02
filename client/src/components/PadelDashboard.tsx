import { useState } from 'react';
import { usePadelContext } from '@/hooks/usePadelContext';
import { useIsMobile } from '@/hooks/use-mobile';
import NavTabs from './shared/NavTabs';
import Toast from './shared/Toast';
import PlayersTab from './PlayersTab';
import PartnershipsTab from './PartnershipsTab';
import MatchesTab from './MatchesTab';
import NewMatchTab from './NewMatchTab';
import StatisticCard from './shared/StatisticCard';
import CalculationGuide from './shared/CalculationGuide';
import { 
  Share as ShareIcon, 
  Download as DownloadIcon 
} from 'lucide-react';

const PadelDashboard = () => {
  const { 
    activeTab, 
    setActiveTab, 
    players, 
    matches, 
    partnerships,
    loading,
    exportData,
    shareApp
  } = usePadelContext();

  // Get mobile status (must be called before any conditional returns)
  const isMobile = useIsMobile();

  const [activeTimeframe, setActiveTimeframe] = useState('recent');
  const [activeRanking, setActiveRanking] = useState('elo');
  const [showFeedback, setShowFeedback] = useState<string | false>(false);

  const handleButtonClick = (action: string, value: string) => {
    // Handle specific actions
    if (action === 'tab') setActiveTab(value);
    if (action === 'timeframe') setActiveTimeframe(value);
    if (action === 'ranking') setActiveRanking(value);
    if (action === 'export') {
      exportData();
      setShowFeedback('Data exported successfully!');
      setTimeout(() => setShowFeedback(false), 2000);
    }
    if (action === 'share') {
      shareApp();
      setShowFeedback('Share link copied to clipboard!');
      setTimeout(() => setShowFeedback(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Filter players with stats (has played at least one match)
  const playersWithStats = [...players].filter(player => 
    (player.wins && player.wins > 0) || 
    (player.losses && player.losses > 0)
  );
  
  // Get top players sorted by selected criteria
  const topPlayers = playersWithStats.sort((a, b) => {
    if (activeRanking === 'elo') {
      return (b.elo || 1500) - (a.elo || 1500);
    } else if (activeRanking === 'wins') {
      return (b.wins || 0) - (a.wins || 0);
    } else if (activeRanking === 'power') {
      return (b.powerRanking || 0) - (a.powerRanking || 0);
    } else {
      // Default to winPct
      return parseFloat(b.winPercentage || "0") - parseFloat(a.winPercentage || "0");
    }
  });

  // Get champion (top player)
  const leagueChampion = topPlayers.length > 0 ? topPlayers[0] : null;

  // Get best partnership
  const bestPartnership = partnerships.length > 0 
    ? [...partnerships].sort((a, b) => 
        parseFloat(b.chemistryRating || "0") - parseFloat(a.chemistryRating || "0")
      )[0] 
    : null;

  // Sort partnerships by chemistry rating
  const topPartnerships = [...partnerships]
    .sort((a, b) => parseFloat(b.chemistryRating || "0") - parseFloat(a.chemistryRating || "0"))
    .slice(0, 3);

  // Recent matches (sorted)
  const recentMatches = [...matches]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // League stats
  const leagueStats = {
    playerCount: players.length,
    matchCount: matches.length,
    partnershipCount: partnerships.length
  };

  // Number of players to display based on screen size
  const playersToShow = isMobile ? 5 : 8;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Modern Header with Branding */}
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-transparent bg-clip-text">Padel League</h1>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto justify-end">
          <button 
            className="px-3 sm:px-4 py-2 bg-white rounded-full shadow-sm text-gray-700 flex items-center hover:shadow-md transition-all cursor-pointer text-sm"
            onClick={() => handleButtonClick('export', 'data')}
          >
            <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-emerald-500" />
            Export
          </button>
          <button 
            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm text-white flex items-center hover:shadow-md transition-all cursor-pointer active:translate-y-0.5 text-sm"
            onClick={() => handleButtonClick('share', 'app')}
          >
            <ShareIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Share
          </button>
        </div>
      </header>

      {/* Modern Navigation */}
      <NavTabs activeTab={activeTab} onTabChange={(tab) => handleButtonClick('tab', tab)} />

      {/* Dashboard Content */}
      {activeTab === 'dashboard' && (
        <>
          {/* Key Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* League Champion */}
            <StatisticCard 
              title="League Champion"
              value={leagueChampion?.name || 'N/A'}
              metrics={[
                { label: 'ELO Rating', value: leagueChampion?.elo?.toString() || 'N/A' },
                { label: 'Win %', value: leagueChampion?.winPercentage?.toString() + '%' || 'N/A' }
              ]}
              bgColor="from-blue-500 to-blue-600"
            />
            
            {/* Best Partnership */}
            <StatisticCard 
              title="Best Partnership"
              value={bestPartnership ? bestPartnership.players.join(' & ') : 'N/A'}
              metrics={[
                { label: 'Win Rate', value: bestPartnership?.winPercentage + '%' || 'N/A' },
                { label: 'Chemistry', value: bestPartnership?.chemistryRating || 'N/A' }
              ]}
              bgColor="from-emerald-500 to-teal-600"
            />
            
            {/* League Overview */}
            <StatisticCard 
              title="League Overview"
              value={`${leagueStats.playerCount} Players`}
              metrics={[
                { label: 'Total Matches', value: leagueStats.matchCount.toString() },
                { label: 'Active Pairs', value: leagueStats.partnershipCount.toString() }
              ]}
              bgColor="from-indigo-500 to-purple-600"
            />
          </div>

          {/* Recent Matches & Top Players */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Matches */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">Recent Matches</h2>
                <button 
                  className="text-sm text-emerald-500 hover:text-emerald-600 font-medium"
                  onClick={() => handleButtonClick('tab', 'matches')}
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {recentMatches.length > 0 ? (
                  recentMatches.map((match, index) => (
                    <div key={index} className="border border-gray-100 rounded-lg p-3 sm:p-4 hover:shadow-sm transition-all">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">
                          {new Date(match.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </span>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                          Completed
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="hidden sm:flex flex-col items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                            <span className="text-xs font-medium text-blue-800">
                              {match.playerA1.charAt(0)}
                            </span>
                          </div>
                          <div className="hidden sm:flex flex-col items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                            <span className="text-xs font-medium text-blue-800">
                              {match.playerA2.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium">
                            {match.playerA1} & {match.playerA2}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <span className={`text-lg font-bold ${match.scoreA > match.scoreB ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {match.scoreA}
                          </span>
                          <span className="text-sm text-gray-400">vs</span>
                          <span className={`text-lg font-bold ${match.scoreB > match.scoreA ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {match.scoreB}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {match.playerB1} & {match.playerB2}
                          </span>
                          <div className="hidden sm:flex flex-col items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                            <span className="text-xs font-medium text-gray-800">
                              {match.playerB1.charAt(0)}
                            </span>
                          </div>
                          <div className="hidden sm:flex flex-col items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                            <span className="text-xs font-medium text-gray-800">
                              {match.playerB2.charAt(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <div>
                          <span className={match.scoreA > match.scoreB ? 'text-emerald-500' : 'text-red-500'}>
                            {match.scoreA > match.scoreB 
                              ? `+${match.eloChangeA1}` 
                              : match.eloChangeA1}
                          </span> ELO change
                        </div>
                        <div>
                          Point Diff: <span className="font-medium">
                            {match.scoreA - match.scoreB > 0 ? `+${match.scoreA - match.scoreB}` : match.scoreA - match.scoreB}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No matches recorded yet
                  </div>
                )}
              </div>
            </div>

            {/* Top Players */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">Player Rankings</h2>
                <div className="flex space-x-2">
                  <button 
                    className={`px-2 py-1 text-xs rounded-md cursor-pointer ${
                      activeRanking === 'elo' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => handleButtonClick('ranking', 'elo')}
                  >
                    ELO
                  </button>
                  <button 
                    className={`px-2 py-1 text-xs rounded-md cursor-pointer ${
                      activeRanking === 'wins' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => handleButtonClick('ranking', 'wins')}
                  >
                    Wins
                  </button>
                  <button 
                    className={`px-2 py-1 text-xs rounded-md cursor-pointer ${
                      activeRanking === 'winPct' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => handleButtonClick('ranking', 'winPct')}
                  >
                    Win %
                  </button>
                  <button 
                    className={`px-2 py-1 text-xs rounded-md cursor-pointer ${
                      activeRanking === 'power' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => handleButtonClick('ranking', 'power')}
                  >
                    Power
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-2 font-medium text-gray-500 text-sm">Rank</th>
                      <th className="pb-2 font-medium text-gray-500 text-sm">Player</th>
                      <th className="pb-2 font-medium text-gray-500 text-sm text-right">
                        {activeRanking === 'power' ? 'Power Rank' : 'ELO Rating'}
                      </th>
                      <th className="pb-2 font-medium text-gray-500 text-sm text-right">W/L</th>
                      <th className="pb-2 font-medium text-gray-500 text-sm text-right">Win %</th>
                      {activeRanking === 'power' && (
                        <th className="pb-2 font-medium text-gray-500 text-sm text-right">Point Diff</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {topPlayers.slice(0, playersToShow).map((player, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 text-sm font-medium">{index + 1}</td>
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs font-medium text-blue-800">
                                {player.name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div className="font-medium">{player.name}</div>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-right font-bold text-emerald-600">
                          {activeRanking === 'power' 
                            ? (player.powerRanking || 0).toFixed(1)
                            : player.elo || 1500}
                        </td>
                        <td className="py-3 text-sm text-right text-gray-600">
                          {player.wins || 0}/{player.losses || 0}
                        </td>
                        <td className="py-3 text-sm text-right text-gray-600">
                          {player.winPercentage || '0'}%
                        </td>
                        {activeRanking === 'power' && (
                          <td className="py-3 text-sm text-right text-gray-600">
                            {((player.pointDiff || 0) > 0) ? `+${player.pointDiff || 0}` : (player.pointDiff || 0)}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Partnerships Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Top Partnerships</h2>
              <button 
                className="text-sm text-emerald-500 hover:text-emerald-600 font-medium"
                onClick={() => handleButtonClick('tab', 'partnerships')}
              >
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topPartnerships.map((partnership, index) => (
                <div key={index} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-800">
                          {partnership.players[0].charAt(0)}
                        </span>
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center -ml-2">
                        <span className="text-xs font-medium text-emerald-800">
                          {partnership.players[1].charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 ${
                      parseFloat(partnership.winPercentage) > 50
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-800'
                      } text-xs font-medium rounded-full`}>
                      {partnership.winPercentage}% Win
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 mb-3">
                    {partnership.players.join(' & ')}
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500">Matches</div>
                      <div className="font-bold text-gray-800">
                        {partnership.gamesPlayed}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500">Chemistry</div>
                      <div className={`font-bold ${
                        parseFloat(partnership.chemistryRating) > 100
                          ? 'text-emerald-600'
                          : 'text-gray-400'
                      }`}>
                        {partnership.chemistryRating}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500">Point Diff</div>
                      <div className="font-bold text-gray-800">
                        {partnership.pointDiff > 0 ? `+${partnership.pointDiff}` : partnership.pointDiff}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calculation Guide Section */}
          <CalculationGuide />
        </>
      )}

      {/* Players Tab */}
      {activeTab === 'players' && <PlayersTab />}

      {/* Partnerships Tab */}
      {activeTab === 'partnerships' && <PartnershipsTab />}

      {/* Matches Tab */}
      {activeTab === 'matches' && <MatchesTab />}

      {/* New Match Tab */}
      {activeTab === 'newMatch' && <NewMatchTab />}

      {/* Toast Notification */}
      {showFeedback && <Toast message={showFeedback} />}
    </div>
  );
};

export default PadelDashboard;