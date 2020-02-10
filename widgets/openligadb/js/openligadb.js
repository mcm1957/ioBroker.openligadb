/*
    ioBroker.vis openligadb Widget-Set

    Copyright 2020 oweitman oweitman@gmx.de
    
*/
"use strict";

// add translations for edit mode
if (vis.editMode) {
    $.extend(true, systemDictionary, {
        "allmatches_oid": {"en": "allmatches", "de": "allmatches", "ru": "allmatches"},
        "currgameday_oid": {"en": "currgameday", "de": "currgameday", "ru": "currgameday"},        
        });
}


vis.binds["openligadb"] = {
    version: "0.5.0",
    showVersion: function () {
        if (vis.binds["openligadb"].version) {
            console.log('Version openligadb: ' + vis.binds["openligadb"].version);
            vis.binds["openligadb"].version = null;
        }
    },
    
    
    favgames2: {
        createWidget: function (widgetID, view, data, style) {
            
            var $div = $('#' + widgetID);
            // if nothing found => wait
            if (!$div.length) {
                return setTimeout(function () {
                    vis.binds["openligadb"].favgames2.createWidget(widgetID, view, data, style);
                }, 100);
            }
            var favgames = [];
            var showabbreviation = data.showabbreviation || false;
            var showweekday = data.showweekday || false;
            var showresult = data.showresult || false;
            var maxicon = data.maxicon || 25;
            var nohighlight = '';

            for (var i = 1; i <= data.lCount; i++) {

                var allmatches  = data['allmatches_oid'+i] ? JSON.parse(vis.states.attr( data['allmatches_oid'+i] + '.val')) : {};
                var currgameday = data['currgameday_oid'+i] ? JSON.parse(vis.states.attr(data['currgameday_oid'+i] + '.val')) : {};
                var showgameday = data['showgameday'+i] || '';
                if (vis.editMode && /{.*}/gm.test(showgameday))  showgameday = '';
                if (showgameday==0) showgameday='';
                showgameday = showgameday || currgameday || '';
                var showgamedaycount = data['showgamedaycount'+i] || 9999;
                if (showgamedaycount==0) showgamedaycount = 9999;

                var abbreviation = data['abbreviation'+i] || '';
                var shortname = data['shortname'+i] || false;
                var highlight = data['highlight'+i] || '';

                favgames=favgames.concat(this.filterFavGames(allmatches, showgameday, showgamedaycount, currgameday, highlight,shortname,abbreviation));  
                if (highlight=='') nohighlight += 'group'+i+' ';
            }
            favgames = this.sortFavGames(favgames);

            var weekday_options = { weekday: 'short' };
            var date_options = { year: 'numeric', month: '2-digit', day: '2-digit' };
            var time_options = { hour: '2-digit', minute: '2-digit' };            
            var text ='';
            
            text += '<style> \n';
            text += '#'+widgetID + ' .oldb-icon {\n';
            text += '   max-height: ' + maxicon + 'px; \n';
            text += '   max-width: ' + maxicon + 'px; \n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-tdicon {\n';
            text += '   width: ' + maxicon + 'px; \n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-tt {\n';
            text += '   width: 100%;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-tt td{\n';
            text += '   white-space: nowrap;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-full {\n';
            text += '   width: 50%;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-center {\n';
            text += '   text-align: center;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-right {\n';
            text += '   text-align: right;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-left {\n';
            text += '   text-align: left;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-datetime {\n';
            text += '       font-weight: bold;\n';
            text += '} \n';            
            text += '</style> \n';
            
            text += '<table class="oldb-tt">';

            favgames.forEach(function(match, index) {
                var team1name = match.shortname ? match.Team1.ShortName : match.Team1.TeamName;
                var team2name = match.shortname ? match.Team2.ShortName : match.Team2.TeamName;
                if (vis.binds["openligadb"].checkHighlite(team1name,match.highlight)) team1name = '<b class="favorite">' + team1name + '</b>';
                if (vis.binds["openligadb"].checkHighlite(team2name,match.highlight)) team2name = '<b class="favorite">' + team2name + '</b>';
                var result = vis.binds["openligadb"].getResult(match.MatchResults);
                var team1result = result.hasOwnProperty('PointsTeam1') ? result.PointsTeam1 : '-';
                var team2result = result.hasOwnProperty('PointsTeam2') ? result.PointsTeam2 : '-';
                
                var today = new Date();
                var mdate = vis.binds["openligadb"].getDateFromJSON(match.MatchDateTime);
                (vis.binds["openligadb"].compareDate(today,mdate)) ? text += '        <tr class="todaygame">' : text += '        <tr>';

                if (showweekday) text += '           <td class="oldb-left">'+ vis.binds["openligadb"].getDateFromJSON(match.MatchDateTime).toLocaleString(vis.language,weekday_options)  +'</td>';
                text += '           <td class="oldb-left">'+ vis.binds["openligadb"].getDateFromJSON(match.MatchDateTime).toLocaleString(vis.language,date_options)  +'</td>';
                text += '           <td class="oldb-left">'+ vis.binds["openligadb"].getDateFromJSON(match.MatchDateTime).toLocaleString(vis.language,time_options)  +'</td>';
                if (showabbreviation) text += '           <td class="oldb-left">'+ match.abbreviation +'</td>';
                text += '           <td class="oldb-center oldb-tdicon">';
                text += '              <img class="oldb-icon" src="'+match.Team1.TeamIconUrl+'">';
                text += '           </td>';
                text += '           <td class="oldb-full">'+ team1name +'</td>';
                if (showresult) text += '           <td class="oldb-left">'+team1result+'</td>';
                text += '           <td class="oldb-left">:</td>';
                if (showresult) text += '           <td class="oldb-left">'+team2result+'</td>';
                text += '           <td class="oldb-center oldb-tdicon">';
                text += '              <img class="oldb-left oldb-icon" src="'+match.Team2.TeamIconUrl+'">';
                text += '           </td>';
                text += '           <td class="oldb-full">'+ team2name +'</td>';                
                text += '        </tr>';
            });
            if (nohighlight != '') text += '<tr><td>No filter set for: ' + nohighlight + '</td></tr>';
            text += '</table>            ';            
            $('#' + widgetID).html(text);            

        },
        filterFavGames: function(allmatches,gameday,gamedaycount,currgameday,highlight,shortname, abbreviation) {
            if (!Array.isArray(allmatches)) return [];
            gameday = parseInt(gameday);
            gamedaycount = parseInt(gamedaycount);
            currgameday = parseInt(currgameday);
            
            return allmatches.reduce(function(result,item){
                var found;
                item.abbreviation = abbreviation;
                if (gameday > 0 && item.Group.GroupOrderID >= gameday && item.Group.GroupOrderID < gameday + gamedaycount ) found=item;
                if (gameday < 0 && item.Group.GroupOrderID >= currgameday + gameday && item.Group.GroupOrderID < currgameday + gameday + gamedaycount) found=item;
                item.highlight=highlight;
                item.shortname=shortname;
                if (found && (vis.binds["openligadb"].checkHighlite(item.Team1.TeamName,highlight) || vis.binds["openligadb"].checkHighlite(item.Team2.TeamName,highlight)) ) result.push(item);
                return result;
            },[]);            
        },
        sortFavGames: function(favgames) {
            return favgames.sort(function(a,b){
                var comp = 0;
                if (vis.binds["openligadb"].getDateFromJSON(a.MatchDateTime).getTime()>vis.binds["openligadb"].getDateFromJSON(b.MatchDateTime).getTime()) comp=1;
                if (vis.binds["openligadb"].getDateFromJSON(a.MatchDateTime).getTime()<vis.binds["openligadb"].getDateFromJSON(b.MatchDateTime).getTime()) comp=-1;
                return comp;
            });
        },
    },         
    
    favgames: {
        createWidget: function (widgetID, view, data, style) {
            
            var $div = $('#' + widgetID);
            // if nothing found => wait
            if (!$div.length) {
                return setTimeout(function () {
                    vis.binds["openligadb"].favgames.createWidget(widgetID, view, data, style);
                }, 100);
            }
            var allmatches  = data.allmatches_oid ? JSON.parse(vis.states.attr(data.allmatches_oid + '.val')) : {};
            var currgameday = data.currgameday_oid ? JSON.parse(vis.states.attr(data.currgameday_oid + '.val')) : {};
            var showgameday = data.showgameday || '';
            if (vis.editMode && /{.*}/gm.test(showgameday))  showgameday = '';
            if (showgameday==0) showgameday='';
            showgameday = showgameday || currgameday || '';
            var showgamedaycount = data.showgamedaycount || 9999;
            if (showgamedaycount==0) showgamedaycount = 9999;

            var maxicon = data.maxicon || 25;
            var shortname = data.shortname || false;
            var highlight = data.highlight || '';
            
            var favgames = this.filterFavGames(allmatches, showgameday, showgamedaycount, currgameday, highlight);  
            
            var date_options = { year: 'numeric', month: '2-digit', day: '2-digit' };
            var time_options = { hour: '2-digit', minute: '2-digit' };            
            var text ='';
            
            text += '<style> \n';
            text += '#'+widgetID + ' .oldb-icon {\n';
            text += '   max-height: ' + maxicon + 'px; \n';
            text += '   max-width: ' + maxicon + 'px; \n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-tdicon {\n';
            text += '   width: ' + maxicon + 'px; \n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-tt {\n';
            text += '   width: 100%;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-tt td{\n';
            text += '   white-space: nowrap;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-full {\n';
            text += '   width: 50%;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-center {\n';
            text += '   text-align: center;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-right {\n';
            text += '   text-align: right;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-left {\n';
            text += '   text-align: left;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-datetime {\n';
            text += '       font-weight: bold;\n';
            text += '} \n';            
            text += '</style> \n';
            
            text += '<table class="oldb-tt">';

            favgames.forEach(function(match, index) {
                var team1name = shortname ? match.Team1.ShortName : match.Team1.TeamName;
                var team2name = shortname ? match.Team2.ShortName : match.Team2.TeamName;
                
                text += '        <tr>';
                text += '           <td class="oldb-left">'+ vis.binds["openligadb"].getDateFromJSON(match.MatchDateTime).toLocaleString(vis.language,date_options)  +'</td>';
                text += '           <td class="oldb-left">'+ vis.binds["openligadb"].getDateFromJSON(match.MatchDateTime).toLocaleString(vis.language,time_options)  +'</td>';
                text += '           <td class="oldb-center oldb-tdicon">';
                text += '              <img class="oldb-icon" src="'+match.Team1.TeamIconUrl+'">';
                text += '           </td>';
                text += '           <td class="oldb-full">'+ team1name +'</td>';
                text += '           <td class="oldb-left">:</td>';
                text += '           <td class="oldb-center oldb-tdicon">';
                text += '              <img class="oldb-left oldb-icon" src="'+match.Team2.TeamIconUrl+'">';
                text += '           </td>';
                text += '           <td class="oldb-full">'+ team2name +'</td>';                
                text += '        </tr>';
            });
            if (highlight == '') text += '<tr><td>Not filter set</td></tr>';
            text += '<tr><td colspan="7">This widget is deprecated. Please use FavGames2</td></tr>';
            text += '</table>            ';            
            $('#' + widgetID).html(text);            

            
        },
        filterFavGames: function(allmatches,gameday,gamedaycount,currgameday,highlight) {
            gameday = parseInt(gameday);
            gamedaycount = parseInt(gamedaycount);
            currgameday = parseInt(currgameday);
            
            return allmatches.reduce(function(result,item){
                var found;
                if (gameday > 0 && item.Group.GroupOrderID >= gameday && item.Group.GroupOrderID < gameday + gamedaycount ) found=item;
                if (gameday < 0 && item.Group.GroupOrderID >= currgameday + gameday && item.Group.GroupOrderID < currgameday + gameday + gamedaycount) found=item;
                if (found && (vis.binds["openligadb"].checkHighlite(item.Team1.TeamName,highlight) || vis.binds["openligadb"].checkHighlite(item.Team2.TeamName,highlight)) ) result.push(item);
                return result;
            },[]);            
        },
        
    },     

    gameday: {
        createWidget: function (widgetID, view, data, style) {
            
            var $div = $('#' + widgetID);
            // if nothing found => wait
            if (!$div.length) {
                return setTimeout(function () {
                    vis.binds["openligadb"].gameday.createWidget(widgetID, view, data, style);
                }, 100);
            }
            
            var allmatches  = data.allmatches_oid ? JSON.parse(vis.states.attr(data.allmatches_oid + '.val')) : {};
            var currgameday = data.currgameday_oid ? JSON.parse(vis.states.attr(data.currgameday_oid + '.val')) : {};
            var showgameday = data.showgameday || '';
            if (vis.editMode && /{.*}/gm.test(showgameday))  showgameday = '';
            if (showgameday==0) showgameday='';
            var showgamedaycount = data.showgamedaycount || 1;
            if (showgamedaycount==0) showgamedaycount = 1;
            var showweekday = data.showweekday || false;
            var showgoals = data.showgoals || false;

            var maxicon = data.maxicon || 25;
            var shortname = data.shortname || false;
            var highlight = data.highlight || '';
            
            
            var gameday = this.filterGameDay(allmatches,showgameday || currgameday || '', showgamedaycount, currgameday);            
            
            var text ='';

            text += '<style> \n';
            text += '#'+widgetID + ' .oldb-icon {\n';
            text += '   max-height: ' + maxicon + 'px; \n';
            text += '   max-width: ' + maxicon + 'px; \n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-tdicon {\n';
            text += '   width: ' + maxicon + 'px; \n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-tt {\n';
            text += '   width: 100%;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-tt td{\n';
            text += '   white-space: nowrap;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-wrap {\n';
            text += '   white-space: normal !important;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-goal {\n';
            text += '   white-space: nowrap;\n';
            text += '   display: inline-block;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-full {\n';
            text += '   width: 50%;\n';
            text += '} \n';            
            text += '#'+widgetID + ' .oldb-center {\n';
            text += '   text-align: center;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-right {\n';
            text += '   text-align: right;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-left {\n';
            text += '   text-align: left;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-datetime {\n';
            text += '       font-weight: bold;\n';
            text += '} \n';
            text += '</style> \n';
            
            text += '<table class="oldb-tt">';

            var curDate,oldDate ='' ;
            var date_options = (showweekday) ? { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' } : { year: 'numeric', month: '2-digit', day: '2-digit' };
            var time_options = { hour: '2-digit', minute: '2-digit' };
            gameday.forEach(function(match, index) {

                var today = new Date();
                var mdate = vis.binds["openligadb"].getDateFromJSON(match.MatchDateTime);

                
                if (mdate.toString() != oldDate.toString()) {
                    oldDate=mdate;
                    (vis.binds["openligadb"].compareDate(today,mdate)) ? text += '        <tr class="todaygameheader">' : text += '        <tr>';                    
                    text += '           <td class="oldb-right oldb-datetime" colspan="3">'+ mdate.toLocaleString(vis.language,date_options) +'</td>';
                    text += '           <td class=""></td>';
                    text += '           <td class="oldb-left oldb-datetime" colspan="3">'+ mdate.toLocaleString(vis.language,time_options) +'</td>';
                    text += '        </tr>';
                }
                
                var team1name = shortname ? match.Team1.ShortName : match.Team1.TeamName;
                var team2name = shortname ? match.Team2.ShortName : match.Team2.TeamName;
                if (vis.binds["openligadb"].checkHighlite(team1name,highlight)) team1name = '<b class="favorite">' + team1name + '</b>';
                if (vis.binds["openligadb"].checkHighlite(team2name,highlight)) team2name = '<b class="favorite">' + team2name + '</b>';

                var result = vis.binds["openligadb"].getResult(match.MatchResults);
                var team1result = result.hasOwnProperty('PointsTeam1') ? result.PointsTeam1 : '-';
                var team2result = result.hasOwnProperty('PointsTeam2') ? result.PointsTeam2 : '-';
                
                (vis.binds["openligadb"].compareDate(today,mdate)) ? text += '        <tr class="todaygame">' : text += '        <tr>';  
                text += '           <td class="oldb-right oldb-full">'+ team1name +'</td>';
                text += '           <td class="oldb-center oldb-tdicon">';
                text += '              <img class="oldb-icon" src="'+match.Team1.TeamIconUrl+'">';
                text += '           </td>';
                text += '           <td class="oldb-center">'+team1result+'</td>';
                text += '           <td class="oldb-center">:</td>';
                text += '           <td class="oldb-center">'+team2result+'</td>';
                text += '           <td class="oldb-center oldb-tdicon">';
                text += '              <img class="oldb-center oldb-icon" src="'+match.Team2.TeamIconUrl+'">';
                text += '           </td>';
                text += '           <td class="oldb-left oldb-full">'+ team2name +'</td>';                
                text += '        </tr>';

                var goals = this.getGoals(match);
                if (showgoals && goals !='' ) {
                    text += '        <tr>';
                    text += '           <td class="oldb-center oldb-wrap" colspan="7"><small>'+ this.getGoals(match) +'</small></td>';                                
                    text += '        </tr>';
                }
            }.bind(this));

            text += '</table>            ';

            $('#' + widgetID).html(text);
        },
        filterGameDay: function(allmatches,gameday,gamedaycount,currgameday) {
            gameday = parseInt(gameday);
            gamedaycount = parseInt(gamedaycount);
            currgameday = parseInt(currgameday);
            
            return allmatches.reduce(function(result,item){
                if (gameday > 0 && item.Group.GroupOrderID >= gameday && item.Group.GroupOrderID < gameday + gamedaycount ) result.push(item);
                if (gameday < 0 && item.Group.GroupOrderID >= currgameday + gameday && item.Group.GroupOrderID < currgameday + gameday + gamedaycount) result.push(item);
                return result;
            },[]);            
        },
        getGoals: function(match) {
            var goals = [];
            match.Goals.forEach(function(match, index,arr) {
                var goal = '';
                goal += match.ScoreTeam1+':'+match.ScoreTeam2+' '+match.GoalGetterName+' '+'('+match.MatchMinute+')';
                goal += (match.IsPenalty) ? ' (Elfmeter)' : '';
                goal += (match.IsOwnGoal) ? ' (Eigentor)' : '';
                goal += index < arr.length-1 ? ', ' : '';
                goals += '<span class="oldb-goal">' + goal + '</span>';
            });
            return goals;
        }       
    },
    table2: {
        createWidget: function (widgetID, view, data, style) {        
            var $div = $('#' + widgetID);
            // if nothing found => wait
            if (!$div.length) {
                return setTimeout(function () {
                    vis.binds["openligadb"].table2.createWidget(widgetID, view, data, style);
                }, 100);
            }
            var allmatches = data.allmatches_oid ? JSON.parse(vis.states.attr(data.allmatches_oid + '.val')) : {};
            var mode = data.mode || '1home';
            var mymode=mode[0];

            var table = allmatches.reduce(function(result,item){
                var team1name = item.Team1.TeamName;
                var shortname1 = item.Team1.ShortName;
                var teamiconurl1 = item.Team1.TeamIconUrl;
                var team2name = item.Team2.TeamName;
                var shortname2 = item.Team2.ShortName;
                var teamiconurl2 = item.Team2.TeamIconUrl;
                
                if (result.hasOwnProperty(team1name)) {
                    var team1 =result[team1name];
                } else {
                    var team1 = {
                        "TeamName":         team1name,
                        "ShortName":        shortname1,
                        "TeamIconUrl":      teamiconurl1,
                        "Points":           0,
                        "OpponentGoals":    0,
                        "Goals":            0,
                        "Matches":          0,
                        "Won":              0,
                        "Lost":             0,
                        "Draw":             0,
                        "GoalDiff":         0
                        
                    }
                }
                if (result.hasOwnProperty(team2name)) {
                    var team2 =result[team2name];
                } else {
                    var team2 = {
                        "TeamName":         team2name,
                        "ShortName":        shortname2,
                        "TeamIconUrl":      teamiconurl2,
                        "Points":           0,
                        "OpponentGoals":    0,
                        "Goals":            0,
                        "Matches":          0,
                        "Won":              0,
                        "Lost":             0,
                        "Draw":             0,
                        "GoalDiff":         0

                    }
                }
                var matchresult = vis.binds["openligadb"].getResult(item.MatchResults);
                if (matchresult.hasOwnProperty('PointsTeam1')) {

                    if (matchresult.PointsTeam1>matchresult.PointsTeam2) {
                        if (mymode==1 || mymode ==2) {
                            team1.Points        += 3;
                            team1.OpponentGoals += matchresult.PointsTeam2;
                            team1.Goals         += matchresult.PointsTeam1;
                            team1.Matches       += 1;
                            team1.Won           += 1;
                            team1.GoalDiff      = team1.Goals-team1.OpponentGoals;
                        }

                        if (mymode==1 || mymode ==3) {
                            team2.Points        += 0;
                            team2.OpponentGoals += matchresult.PointsTeam1;
                            team2.Goals         += matchresult.PointsTeam2;
                            team2.Matches       += 1;
                            team2.Lost          += 1;
                            team2.GoalDiff      = team2.Goals-team2.OpponentGoals;
                        }                        
                    }
                    if (matchresult.PointsTeam1==matchresult.PointsTeam2) {
                        if (mymode==1 || mymode ==2) {
                            team1.Points        += 1;
                            team1.OpponentGoals += matchresult.PointsTeam2;
                            team1.Goals         += matchresult.PointsTeam1;
                            team1.Matches       += 1;
                            team1.Draw          += 1;
                            team1.GoalDiff      = team1.Goals-team1.OpponentGoals;
                        }

                        if (mymode==1 || mymode ==3) {
                            team2.Points        += 1;
                            team2.OpponentGoals += matchresult.PointsTeam1;
                            team2.Goals         += matchresult.PointsTeam2;
                            team2.Matches       += 1;
                            team2.Draw          += 1;
                            team2.GoalDiff      = team2.Goals-team2.OpponentGoals;
                        }
                    }
                    if (matchresult.PointsTeam1<matchresult.PointsTeam2) {
                        if (mymode==1 || mymode ==2) {
                            team1.Points        += 0;
                            team1.OpponentGoals += matchresult.PointsTeam2;
                            team1.Goals         += matchresult.PointsTeam1;
                            team1.Matches       += 1;
                            team1.Lost          += 1;
                            team1.GoalDiff      = team1.Goals-team1.OpponentGoals;
                        }

                        if (mymode==1 || mymode ==3) {
                            team2.Points        += 3;
                            team2.OpponentGoals += matchresult.PointsTeam1;
                            team2.Goals         += matchresult.PointsTeam2;
                            team2.Matches       += 1;
                            team2.Won           += 1;
                            team2.GoalDiff      = team2.Goals-team2.OpponentGoals;
                        }
                    }
                }
                result[team1name]=team1;
                result[team2name]=team2;
                
                return result;
            },[]);            
            var newtable = new Array();
            for (var items in table){
                newtable.push( table[items] );
            }
            table = newtable.sort(function(a,b) {
                return (a.Points > b.Points) ? -1 : ((b.Points > a.Points) ? 1 : (a.GoalDiff<b.GoalDiff) ? 1: (a.GoalDiff>b.GoalDiff)? -1:0);
            }); 

            var maxicon = data.maxicon || 25;
            var shortname = data.shortname || false;
            var highlight = data.highlight || '';
            
            var text ='';

            text += '<style> \n';
            text += '#'+widgetID + ' .oldb-icon {\n';
            text += '   max-height: ' + maxicon + 'px; \n';
            text += '   max-width: ' + maxicon + 'px; \n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-tt {\n';
            text += '   width: 100%;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-tt td{\n';
            text += '   white-space: nowrap;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-full {\n';
            text += '   width: 100%;\n';
            text += '} \n';                        
            text += '#'+widgetID + ' .oldb-center {\n';
            text += '   text-align: center;\n';
            text += '} \n';
            text += '</style> \n';
            
            text += '<table class="oldb-tt">';
            text += '    <thead>';
            text += '    <tr >';            
            text += '        <th class="oldb-center oldb-rank">';
            text += '            #';
            text += '        </th>';
            text += '        <th colspan="2" class="oldb-clubheader" style="text-align: left;">';
            text += '            Club';
            text += '        </th>';
            text += '';
            text += '        <th class="oldb-center oldb-games">';
            text += '            Sp';
            text += '        </th>';
            text += '        <th class="oldb-center oldb-won">';
            text += '            S';
            text += '        </th>';
            text += '        <th class="oldb-center oldb-draw">';
            text += '            U';
            text += '        </th>';
            text += '        <th class="oldb-center oldb-lost">';
            text += '            N';
            text += '        </th>';
            text += '        <th class="oldb-center oldb-goals">';
            text += '            Tore';
            text += '        </th>';
            text += '        <th class="oldb-center oldb-points">';
            text += '            Punkte';
            text += '        </th>';
            text += '    </tr>';
            text += '    </thead>';

            text += '    <tbody class="oldb-tb">';
            
            table.forEach(function(team, index) {

                var teamname = shortname ? team.ShortName : team.TeamName;
                if (vis.binds["openligadb"].checkHighlite(teamname,highlight)) teamname = '<b class="favorite">' + teamname + '</b>';
                
                text += '        <tr>';
                text += '            <td class="oldb-center oldb-rank">';
                text += index +1;
                text += '            </td>';
                text += '            <td class="oldb-center">';
                text += '                <img class="oldb-icon" src="'+team.TeamIconUrl+'">';
                text += '            </td>';
                text += '            <td class="oldb-teamname oldb-full">';
                text += '                <span>'+teamname+'</span>';
                text += '            </td>';
                text += '            <td class="oldb-center oldb-games">';
                text += team.Matches;
                text += '            </td>';
                text += '            <td class="oldb-center oldb-won">';
                text += team.Won;
                text += '           </td>';
                text += '            <td class="oldb-center oldb-draw">';
                text += team.Draw;
                text += '            </td>';
                text += '            <td class="oldb-center oldb-lost">';
                text += team.Lost;
                text += '            </td>';
                text += '            <td class="oldb-center oldb-goals">';
                text += team.Goals + ':' + team.OpponentGoals;
                text += '            </td>';
                text += '            <td class="oldb-center oldb-points">';
                text += '                <strong>'+team.Points+'</strong>';
                text += '            </td>';
                text += '        </tr>';
            });
            text += '    </tbody>';
            text += '</table>            ';
            
            $('#' + widgetID).html(text);
        }            
            
            
            
    },
    table: {
        createWidget: function (widgetID, view, data, style) {

            var $div = $('#' + widgetID);
            // if nothing found => wait
            if (!$div.length) {
                return setTimeout(function () {
                    vis.binds["openligadb"].table.createWidget(widgetID, view, data, style);
                }, 100);
            }
            var table = data.oid ? JSON.parse(vis.states.attr(data.oid + '.val')) : {};
            var maxicon = data.maxicon || 25;
            var shortname = data.shortname || false;
            var highlight = data.highlight || '';
            
            var text ='';

            text += '<style> \n';
            text += '#'+widgetID + ' .oldb-icon {\n';
            text += '   max-height: ' + maxicon + 'px; \n';
            text += '   max-width: ' + maxicon + 'px; \n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-tt {\n';
            text += '   width: 100%;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-tt td{\n';
            text += '   white-space: nowrap;\n';
            text += '} \n';
            text += '#'+widgetID + ' .oldb-full {\n';
            text += '   width: 100%;\n';
            text += '} \n';                        
            text += '#'+widgetID + ' .oldb-center {\n';
            text += '   text-align: center;\n';
            text += '} \n';
            text += '</style> \n';
            
            text += '<table class="oldb-tt">';
            text += '    <thead>';
            text += '    <tr >';            
            text += '        <th class="oldb-center oldb-rank">';
            text += '            #';
            text += '        </th>';
            text += '        <th colspan="2" class="oldb-clubheader" style="text-align: left;">';
            text += '            Club';
            text += '        </th>';
            text += '';
            text += '        <th class="oldb-center oldb-games">';
            text += '            Sp';
            text += '        </th>';
            text += '        <th class="oldb-center oldb-won">';
            text += '            S';
            text += '        </th>';
            text += '        <th class="oldb-center oldb-draw">';
            text += '            U';
            text += '        </th>';
            text += '        <th class="oldb-center oldb-lost">';
            text += '            N';
            text += '        </th>';
            text += '        <th class="oldb-center oldb-goals">';
            text += '            Tore';
            text += '        </th>';
            text += '        <th class="oldb-center oldb-points">';
            text += '            Punkte';
            text += '        </th>';
            text += '    </tr>';
            text += '    </thead>';

            text += '    <tbody class="oldb-tb">';
            
            table.forEach(function(team, index) {

                var teamname = shortname ? team.ShortName : team.TeamName;
                if (vis.binds["openligadb"].checkHighlite(teamname,highlight)) teamname = '<b class="favorite">' + teamname + '</b>';
                
                text += '        <tr>';
                text += '            <td class="oldb-center oldb-rank">';
                text += index +1;
                text += '            </td>';
                text += '            <td class="oldb-center">';
                text += '                <img class="oldb-icon" src="'+team.TeamIconUrl+'">';
                text += '            </td>';
                text += '            <td class="oldb-teamname oldb-full">';
                text += '                <span>'+teamname+'</span>';
                text += '            </td>';
                text += '            <td class="oldb-center oldb-games">';
                text += team.Matches;
                text += '            </td>';
                text += '            <td class="oldb-center oldb-won">';
                text += team.Won;
                text += '           </td>';
                text += '            <td class="oldb-center oldb-draw">';
                text += team.Draw;
                text += '            </td>';
                text += '            <td class="oldb-center oldb-lost">';
                text += team.Lost;
                text += '            </td>';
                text += '            <td class="oldb-center oldb-goals">';
                text += team.Goals + ':' + team.OpponentGoals;
                text += '            </td>';
                text += '            <td class="oldb-center oldb-points">';
                text += '                <strong>'+team.Points+'</strong>';
                text += '            </td>';
                text += '        </tr>';
            });
            text += '    </tbody>';
            text += '</table>            ';
            
            $('#' + widgetID).html(text);
        }
    },
    checkHighlite: function(value,highlights,sep) {
        sep = typeof sep !== 'undefined' ? sep : ";";
        var highlight = highlights.split(sep);
        return highlight.reduce(function(acc,cur){
            if (cur=='') return acc;
            return acc || value.toLowerCase().indexOf(cur.toLowerCase())>=0; 
        },false);
    },
    getDateFromJSON: function(datestring) {
        var aDate = datestring.split("T")[0].split("-");
        var aTime = datestring.split("T")[1].split(":");
        return new Date(aDate[0],aDate[1]-1,aDate[2],aTime[0],aTime[1]);
    },
    getResult: function(results) {
        if (results.length==0) return {};
        results = results.reduce(function(acc,cur){
            if (cur.ResultTypeID==2) acc = cur;
            return acc;
        },{});
        return results;
    },
    compareDate: function(adate,bdate) {
        return adate.getDate() == bdate.getDate() && 
               adate.getMonth() == bdate.getMonth() && 
               adate.getYear() == bdate.getYear();
    },
    checkTodayFavorite: function(oid,highlite) {
        if (oid) {
            var json = vis.states.attr( oid + '.val');
            if ((json) && json!='null') {
                console.debug('statedo:'+oid);
                var matches = JSON.parse(json);
                if (matches) {
                    var today = new Date();
                    matches[0].MatchDateTime = "2020-02-05T20:30:00";
                    return matches.reduce(function(result,item){
                        var mdate = vis.binds["openligadb"].getDateFromJSON(item.MatchDateTime);
                        var test =  vis.binds["openligadb"].compareDate(today,mdate) &&
                            (vis.binds["openligadb"].checkHighlite(item.Team1.TeamName,highlite,",") ||
                            vis.binds["openligadb"].checkHighlite(item.Team2.TeamName,highlite,","));
                        if (test) {
                            console.debug('Match for:' + oid + ' and ' + highlite+ " " + item.MatchDateTime + " " + item.Team1.TeamName + " " + item.Team2.TeamName);
                        } 
                        return result || test;
                    },false);
                }
            } else {
                var a = [];
                a.push(oid);
                vis.conn.gettingStates=0;
                console.debug('stateask:'+oid);                    
                vis.conn.getStates(a, function (error, data) {
                    console.debug('stateget:'+oid);                    
                    vis.updateStates(data);
                });                             
            }
        }
        return false;
    },  
}
vis.binds["openligadb"].showVersion();

