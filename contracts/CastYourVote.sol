pragma solidity ^0.4.21; 

contract CastYourVote
{
    
    string[] public candidateList;
    mapping(string => uint256) votesRecieved;
    string subject;
    //
	struct currentMatchRecord{
		uint256 totalVote;
		uint256 totalAmount;
		uint256 winnerValue;
		string[] votedUser;
		mapping(string => uint256) userAmount;
		mapping(string => uint256) userIndex;
		mapping(uint256 => uint256 ) indexVoteCount;   
	}
	
	struct userMatchRecord{
		string publicID;
		uint256 numOfMatchPlayed;
		uint256[] matchNumber;
		uint256[] amountBet;
		uint256[] selectedIndex;
		uint256[] amountGainLoss;
	}
	
	
	string[] public registeredUser;
	mapping(string => string) userKey;
	mapping(string => uint256) balance;
	string adminKey;
	uint256 adminMaxAmount;
	uint256 minimumBetAmount;
	uint256 currentMatchNum;
	uint256 maxTotalVote;
	
	currentMatchRecord[] public matchArray;
	userMatchRecord[] public userMatchRecordArray;
    
    function CastYourVote(string _subject)public {
		adminKey="vkm14255";
		minimumBetAmount=10;
		adminMaxAmount = 9999999;             
		maxTotalVote=3;							// ----- maximum vote in a match  
		addNewMatch();
		
		
		candidateList.push(_subject);  
        subject=_subject;
        //emit log("subject is: ",subject);
    }
    
    
	
	
// for registering user  --------------------------------------------------------------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>

	function newRegistration(string pubID, string priID) public{
		if(!userExist(pubID)){
			registeredUser.push(pubID);
			userKey[pubID]=priID;
			balance[pubID]=0;
			addNewuserMatchRecord(pubID);
		}
	} 
	
	// checking whether registeredUser exist or not
    function userExist(string _candidate) public constant returns(bool){
        for(uint256 i=0;i<registeredUser.length;i++){
            if(keccak256(registeredUser[i])==keccak256(_candidate)){
                return true;
            }
        }
        return false;
    }
	
// for exchange or transfer money   ---------------------------------------------------------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>

	// checking whether admin entered match or not
    function checkingAdmin(string admin) public constant returns(bool){
        if(keccak256(admin)==keccak256(adminKey)){
            return true;
        }
        return false;
    }
	
	// adding money to specified user 
	function amountAdd(string pubID,uint256 amount) public {
		balance[pubID]+=amount;
		adminMaxAmount-=amount;
	}
	
// for voting  ------------------------------------------------------------------------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

	// for checking public, private, and balance of pubIDs 
	function checkPubPriIDAmount(string pubID,string priID,uint256 amount) public constant returns(bool){
		for(uint256 i=0;i<registeredUser.length;i++){
            if(keccak256(registeredUser[i])==keccak256(pubID)){
                if(keccak256(userKey[pubID])==keccak256(priID) && balance[pubID]>=amount){
					return true;
				}
				else 
					return false;
            }
        }
        return false;
	}
	// for checking, entered minimumBetAmount
	function minimumBetCheck(uint256 amount) public constant returns(bool){
		if(amount >= minimumBetAmount)
			return true;
		else 
			return false;
	}

	// function to add match
	function addNewMatch() public {
		currentMatchNum = matchArray.length;
		currentMatchRecord memory tempMatch;// = currentMatchRecord({totalAmount:0,totalVote:0,votedUser: new string[](0) });
		tempMatch.totalAmount=0;
		tempMatch.totalVote=0;
		tempMatch.winnerValue=0;
		matchArray.push(tempMatch);
	}
	
	// for checking user voted or not
	function checkingVotedOrNot(string pubID) public constant returns(bool) {
		currentMatchRecord storage curMatch = matchArray[currentMatchNum];
		for(uint256 i=0;i<curMatch.votedUser.length;i++){
			if(keccak256(curMatch.votedUser[i])==keccak256(pubID))
				return true;
		}
		return false;
	}
	
	// pubID making Vote For Selected Index
	function makingVoteForSelectedIndex(string pubID,uint256 amount,uint256 selectedValue) public{
		currentMatchRecord  storage curMatch= matchArray[currentMatchNum];
		curMatch.totalVote+=1;
		curMatch.totalAmount+=amount;
		curMatch.votedUser.push(pubID);
		curMatch.userIndex[pubID]=selectedValue;
		curMatch.userAmount[pubID]=amount;
		curMatch.indexVoteCount[selectedValue]+=1;
		
		// updating user detail
		for(uint256 i=0;i<userMatchRecordArray.length;i++){
			if( keccak256(userMatchRecordArray[i].publicID) == keccak256(pubID) ){
				userMatchRecordArray[i].numOfMatchPlayed+=1;
				userMatchRecordArray[i].matchNumber.push(currentMatchNum+1);
				userMatchRecordArray[i].amountBet.push(amount);
				userMatchRecordArray[i].selectedIndex.push(selectedValue);
				userMatchRecordArray[i].amountGainLoss.push(0);
				break;
			}
		}
		
		balance[pubID]-=amount;    // deducting amount from voting user pubID
		// checking for result declaration
		if(curMatch.totalVote==maxTotalVote){
			declareWinner();
			addNewMatch();
		}
	}
	
	// for declaring winner
	function declareWinner() public {					// TODO
		// selecting winner index
		uint256 winnerIndex = selectingWinner();
		
		currentMatchRecord  storage curMatch= matchArray[currentMatchNum];
		curMatch.winnerValue = winnerIndex;
		uint winningAmount = curMatch.totalAmount/curMatch.indexVoteCount[winnerIndex];
		
		transferWinningAmount(winnerIndex,winningAmount);
		
	}
	
	
	// transfering winningAmount to winner
	function transferWinningAmount(uint256 winnerIndex,uint256 winningAmount) public {
		currentMatchRecord  storage curMatch= matchArray[currentMatchNum];
		for(uint256 i=0;i<curMatch.votedUser.length;i++){
			string memory user = curMatch.votedUser[i];
			if(curMatch.userIndex[user]==winnerIndex){
				balance[user]+=winningAmount;
				
				// updating user detail
				for(uint256 j=0;j<userMatchRecordArray.length;j++){
					if( keccak256(userMatchRecordArray[j].publicID) == keccak256(user) ){
						uint256 len = userMatchRecordArray[j].amountGainLoss.length;
						userMatchRecordArray[j].amountGainLoss[len-1]=winningAmount;
						break;
					}
				}
				
			}
		}
	}
	
	// selecting winner using higher preference candidate
	function selectingWinner() public constant returns(uint256 index){
		
		currentMatchRecord storage curMatch= matchArray[currentMatchNum];
		uint256 mx=0;
		for(uint256 i=0;i<10;i++){
			if(curMatch.indexVoteCount[i] > mx){
				mx=curMatch.indexVoteCount[i];
				index=i;
			}
		}
		return index;
	}
	
//---------------------------------------------------------------------------------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>

	//for user balance 
	function userBalanceCheck(string pubID) public constant returns(uint256 val){
		if(userExist(pubID))
			return balance[pubID];
		else return 98765421239874473652;
	}
	
	// for returning currentMatchNumber  
	function currentMatchNumber() public constant returns(uint256 num){
		return matchArray.length;
	}
	
	// for returning remaining votes in current Match
	function currentMatchRemainVote() public constant returns(uint256 rVote){
		currentMatchRecord storage curMatch= matchArray[currentMatchNum];
		rVote = maxTotalVote - curMatch.totalVote;
		return rVote;
	}
	
	// for returning previous match total amount
	function previousMatchAmount() public constant returns(uint256){
		currentMatchRecord storage curMatch= matchArray[currentMatchNum-1];
		return curMatch.totalAmount;
	}
	
	// for returning previous match winner
	function previousMatchWinner() public constant returns(uint256){
		currentMatchRecord storage curMatch= matchArray[currentMatchNum-1];
		return curMatch.winnerValue;
	}
	
	
	
// for User Record ------------------------------------------------------------------------------------------------>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	
	// adding new user Match record
	function addNewuserMatchRecord(string pubID) public {
		userMatchRecord memory tempRecord;
		tempRecord.publicID = pubID;
		tempRecord.numOfMatchPlayed=0;
		userMatchRecordArray.push(tempRecord);
	}
	
	// returns number of match played by user 
	function findingNumOfMatchUserPlayed(string pubID) public constant returns(uint256 num){
		for(uint256 i=0;i<userMatchRecordArray.length;i++){
			if(keccak256(userMatchRecordArray[i].publicID)==keccak256(pubID)){
				return userMatchRecordArray[i].numOfMatchPlayed;
			}
		}
	}
	
/*	// returning userMatchRecord for row update
	function findingUserRowRecord(string pubID,uint256 index,uint256 colNum) public constant returns(uint256 val){
		for(uint256 i=0;i<userMatchRecordArray.length;i++){
			if(keccak256(userMatchRecordArray[i].publicID)==keccak256(pubID)){
				if(colNum==0){
					userMatchRecordArray[i].matchNumber[index];
				}
				else if(colNum==1){
					userMatchRecordArray[i].amountBet[index];
				}
				else if(colNum==2){
					userMatchRecordArray[i].selectedIndex[index];
				}
				else if(colNum==3){
					userMatchRecordArray[i].amountGainLoss[index];
				}
				break;
				
			}
		}
	}
	
*/	
	
	
	
	
	
	
	
}