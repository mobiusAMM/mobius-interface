{ pkgs }:
pkgs.mkShell {
  buildInputs = with pkgs; [ nodejs yarn python3 ];
  shellHook = ''
    export PATH=$PATH:$HOME/.cargo/bin
  '';
}
