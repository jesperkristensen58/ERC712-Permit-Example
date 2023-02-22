pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract YourContract is ERC20, ERC20Permit {
    constructor() ERC20("Jesper", "JTK") ERC20Permit("Jesper") {}
}