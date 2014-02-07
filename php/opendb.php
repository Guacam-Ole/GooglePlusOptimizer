<?php
	header('Access-Control-Allow-Origin: *'); 
	header('Content-type: application/json; charset=utf-8');
	header("Expires: Mon, 26 Jul 1990 05:00:00 GMT");
	header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
	header("Cache-Control: no-store, no-cache, must-revalidate");
	header("Cache-Control: post-check=0, pre-check=0", false);
	header("Pragma: no-cache");
	
	/* OpenLigaDB2Json */
	/*
	$dbUser="db2json";
	$dbPass="Fr€ddie";
	$dbHost="localhost";
	$dbDatabase="opendb";
	*/
	$dbUser="db11124119-jason";
	$dbPass="Freddie!";
	$dbHost="localhost";
	$dbDatabase="db11124119-jason";
	 
	
	
	function GetClient()
	{	
		$options = array
		(	
			//'encoding'           => 'utf-8',
			'connection_timeout' => 5,
			'exceptions'         => 1,
		);

		$location = 'http://www.OpenLigaDB.de/Webservices/Sportsdata.asmx?WSDL';
		$client = new SoapClient($location, $options);
		return $client;
	}
	
	function GetLiveSportsFromDb($league, $season, $day ) 
	{
		global $dbUser, $dbPass, $dbHost, $dbDatabase;
		$query="SELECT id, content FROM cache WHERE league='$league' AND season=$season AND year=".date("Y")." AND month=".date("m")." AND day=".date("d")." AND hour=".date("H")." AND minute=".date("i")." AND orderId=$day";	
		
		$link = mysql_connect($dbHost, $dbUser, $dbPass);
		
		if (!$link) 
		{
			die(mysql_error());
		}
		if (!mysql_select_db($dbDatabase)) {		
			die(mysql_error());
		}
		
		$result = mysql_query($query);
		if (!$result) {
			die(mysql_error());
		}
		if (mysql_num_rows($result)==0) 
		{
			return null;
		}
		
		return (mysql_result($result,0,"content"));
		mysql_close($link);	
	}
	
	function GetLeaguesFromDb($sport)
	{
		global $dbUser, $dbPass, $dbHost, $dbDatabase;
		$query="SELECT id, content FROM leagues WHERE sport=$sport AND year=".date("Y")." AND month=".date("m");
		
		$link = mysql_connect($dbHost, $dbUser, $dbPass);
		
		if (!$link) 
		{
			die(mysql_error());
		}
		if (!mysql_select_db($dbDatabase)) {		
			die(mysql_error());
		}
		
		$result = mysql_query($query);
		if (!$result) {
			die(mysql_error());
		}
		if (mysql_num_rows($result)==0) 
		{
			return null;
		}
		
		return (mysql_result($result,0,"content"));
		mysql_close($link);	
	}
	
	/*
	
	function ChangeUmlauts($content, $add) 
	{
		echo strpos($content,'ä');
		
		
		$search = array('ä', 'ö', 'ü','Ä', 'Ö', 'Ü','ß');
		$replace = array('ae', 'oe', 'ue','AE','OE','UE','SZ');
		
		if ($add) 
		{
			return str_replace($search, $replace, $content);
		} else 
		{
			return str_replace($replace, $search, $content);
		}		
	}*/
	
	function SaveLiveSportToDb($league, $season, $day, $content) 
	{
		global $dbUser, $dbPass, $dbHost, $dbDatabase;
		$link = mysql_connect($dbHost, $dbUser, $dbPass);
		if (!$link) {
			die(mysql_error());			
		}
		if (!mysql_select_db($dbDatabase)) {
			die(mysql_error());
		}
		
		$query="INSERT INTO cache (league, season, year, month, day, hour, minute, orderId, content) VALUES ('$league', $season, ".date("Y").", ".date("m").", ".date("d").", ".date("H").", ".date("i").", ".$day.", '".addslashes($content)."')";
		
		$result = mysql_query($query, $link) or die(mysql_error());		
	}
	
	function SaveLeagueToDb($sport, $content)
	{
		global $dbUser, $dbPass, $dbHost, $dbDatabase;
		$link = mysql_connect($dbHost, $dbUser, $dbPass);
		if (!$link) {
			die(mysql_error());			
		}
		if (!mysql_select_db($dbDatabase)) {
			die(mysql_error());
		}
		
		$query="INSERT INTO leagues (sport, year, month, content) VALUES ('$sport', ".date("Y").",".date("m")." ,'".addslashes($content)."')";
		
		$result = mysql_query($query, $link) or die(mysql_error());		
	}
	
	function GetAllSports() 
	{
		try
		{
			$client = GetClient();
			$params = new stdClass;
			$response = $client->GetAvailSports();
		}
		catch (SoapFault $e)
		{
			die($e->faultcode . ': ' . $e->faultstring);
		}
		catch (Exception $e)
		{
			die($e->getCode() . ': ' . $e->getMessage());
		}
		return json_encode($response->GetAvailSportsResult);		
	}
	
	function GetLeaguesForSports($sportId)
	{
		try
		{
		$result=GetLeaguesFromDb($sportId);
		if ($result!=null)
		{	
			return $result;			
		}	
			$client = GetClient();
			$params = new stdClass;
			$params->sportID = $sportId;
			$response = $client->GetAvailLeaguesBySports($params);
		}
		catch (SoapFault $e)
		{
			die($e->faultcode . ': ' . $e->faultstring);
		}
		catch (Exception $e)
		{
			die($e->getCode() . ': ' . $e->getMessage());
		}
	
		$result= html_entity_decode(json_encode($response->GetAvailLeaguesBySportsResult));
		
		if ($result!=null)
		{
			SaveLeagueToDb($sportId, $result);
		}
		return $result;
	}
	

	
	function GetResults($league, $year, $day)
	{
		// Zunächst schauen, ob in DB:
		$result=GetLiveSportsFromDb($league, $year, $day );
		if ($result!=null)
		{	
			return $result;			
		}		
		
		try
		{
			
			$client = GetClient();
			$params = new stdClass;
			$params->groupOrderID = $day;
			$params->leagueShortcut = $league;
			$params->leagueSaison = $year;
			$response = $client->GetMatchdataByGroupLeagueSaison($params);
		}
		catch (SoapFault $e)
		{
			die($e->faultcode . ': ' . $e->faultstring);
		}
		catch (Exception $e)
		{
			die($e->getCode() . ': ' . $e->getMessage());
		}
		
		$result=html_entity_decode(json_encode($response->GetMatchdataByGroupLeagueSaisonResult));
		
		// in DB speichern
		if ($result!=null)
		{
			SaveLiveSportToDb($league, $year, $day, $result);
		}
		return $result;
		
	}
	 
	
	function GetCurrentGroup($league)
	{
		try
		{
			$client = GetClient();
			$params = new stdClass;
		
			$params->leagueShortcut = $league;
			
			$response = $client->GetCurrentGroup($params);
		}
		catch (SoapFault $e)
		{
			die($e->faultcode . ': ' . $e->faultstring);
		}
		catch (Exception $e)
		{
			die($e->getCode() . ': ' . $e->getMessage());
		}
	
		return json_encode($response->GetCurrentGroupResult);
	}
	
	function GetData() 
	{
		$command = ( ! empty( $_GET[ 'command' ] ) ) ? $_GET[ 'command' ] : false;		
		$league = ( ! empty( $_GET[ 'league' ] ) ) ? $_GET[ 'league' ] : false;
		$orderId = ( ! empty( $_GET[ 'orderId' ] ) ) ? $_GET[ 'orderId' ] : false;
		$sport = ( ! empty( $_GET[ 'sport' ] ) ) ? $_GET[ 'sport' ] : false;
		$season = ( ! empty( $_GET[ 'season' ] ) ) ? $_GET[ 'season' ] : false;
		
		
		switch ($command) 
		{
			case 'GetResults':
				echo GetResults($league, $season, $orderId);
				break;
			case 'GetAllSports':
				echo GetAllSports();
				break;
			case 'GetCurrentGroup':
				echo GetCurrentGroup($league);
				break;			
			case "GetLeagues":
				echo GetLeaguesForSports($sport);
				break;
			default:
				echo "GetResults(league, season, orderId);
				GetAllSports();
				GetCurrentGroup(league);
				GetLeagues(sport);";
				break;				
		}
	}
	GetData();
	
	function Tests() 
	{
		GetAllSports();				// Alle SportArten
		GetLeaguesForSports(1);		// Alle Ligen für Fussball
		GetCurrentGroup('bl2');		// Aktueller Spieltag 2. Bundesliga 2013/2014		
		GetResults('bl2',2013,20);	// Zweite Bundesliga 2013/2014, 20. Spieltag		
	}
?>