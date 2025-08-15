// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Voting {
    address public owner;
    mapping(address => uint256) public voteCount; // Tracks number of votes per address
    struct Candidate {
        string name;
        uint256 voteCount;
    }
    Candidate[] public candidates;

    event Voted(address indexed voter, uint256 candidateIndex);

    modifier onlyOwner() {
        require(msg.sender == owner, "Hanya owner yang bisa melakukan ini");
        _;
    }

    constructor(string[] memory candidateNames) {
        owner = msg.sender;
        for (uint256 i = 0; i < candidateNames.length; i++) {
            candidates.push(Candidate({name: candidateNames[i], voteCount: 0}));
        }
    }

    function addCandidate(string memory name) public onlyOwner {
        candidates.push(Candidate({name: name, voteCount: 0}));
    }

    function vote(uint256 candidateIndex) public {
        require(voteCount[msg.sender] < 5, "Anda telah mencapai batas maksimum 5 vote");
        require(candidateIndex < candidates.length, "Kandidat tidak ditemukan");

        candidates[candidateIndex].voteCount += 1;
        voteCount[msg.sender] += 1;

        emit Voted(msg.sender, candidateIndex);
    }

    function getCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function getWinner() public view returns (string memory winnerName, uint256 maxVotes) {
        require(candidates.length > 0, "Belum ada kandidat");
        uint256 winnerIndex = 0;
        maxVotes = candidates[0].voteCount;

        for (uint256 i = 1; i < candidates.length; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerIndex = i;
            }
        }
        winnerName = candidates[winnerIndex].name;
    }

    // ✅ Fungsi tambahan agar sesuai dengan ABI frontend
    function getVoteCount(address voter) public view returns (uint256) {
        return voteCount[voter];
    }
}
