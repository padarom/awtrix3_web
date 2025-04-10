{
  pkgs ? import <nixpkgs> {}
}: pkgs.mkShell {
  packages = with pkgs; [
    nodejs
    bun
    prefetch-npm-deps # see server.nix
  ];
}
