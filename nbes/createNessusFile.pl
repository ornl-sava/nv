use strict;
use warnings;
use utf8;
use 5.12.4;
#replaces $orig IP with $repl IP
sub replaceIP{
    my $orig = $_[0];
    my $repl = $_[1];
    my $line = $_[2];
    
    $line =~ s/$orig/$repl/g; 
    return $line;
}

my %inputs = (
    "ubuntu" => [101, 10, "open/ubuntuWorkstation.nbe", "192.168.56.101"],
    "fedora" => [111, 10, "open/fedoraWorkstation.nbe", "192.168.56.102"],
    "LAPP" => [121, 5, "open/lappServer.nbe", "192.168.56.103"],
    "wordpress" => [126, 5, "open/wordpressServer.nbe", "192.168.56.104"],
    "MS" => [131, 2, "open/metasploitable.nbe", "192.168.56.105"]
);

my $outputNBE;
my $outputFile = "testNetwork.nbe";

foreach my $key (keys %inputs){
    my $ip_start = $inputs{$key}[0];
    my $count = $inputs{$key}[1];
    my $input_file = $inputs{$key}[2];
    my $orig_ip = $inputs{$key}[3];

    open(FILE, $input_file);
    my @lines = <FILE>;
    close(FILE);
    for(my $i = 0; $i < $count; $i++){
        foreach my $line (@lines){
            my $new_ip = "192.168.56." . ($ip_start + $i);
            my $new_line = replaceIP($orig_ip, $new_ip, $line);
            $outputNBE = $outputNBE . $new_line;
        }
    }
}

open(FILE, ">", $outputFile);
print FILE $outputNBE;
close(FILE);
