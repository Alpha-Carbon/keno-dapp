with (import <nixpkgs> { });
let
  pkgs = import (builtins.fetchGit rec {
    name = "dapptools-${rev}";
    url = https://github.com/dapphub/dapptools;
    rev = "5ede5565697ce6f34eddbd21b8b5fd5200fb0892"; # master @ 2021-11-14
  }) {};

in
  pkgs.mkShell {
    src = null;
    name = "dapptools-template";
    buildInputs = with pkgs; [
      pkgs.dapp
      pkgs.seth
      pkgs.go-ethereum-unlimited
      pkgs.hevm
      pkgs.ethsign
	  pkgs.jq

      nodePackages.yarn
    ];
  }
