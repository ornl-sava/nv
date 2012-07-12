The main use case for our system is to make it easier for administrators to
visualize and prioritize system maintenance.  The grouping functionality allows
the administrator to group together related machines by subnet, purpose of
functionality.  In the example virtual system machines are grouped into three
different categories.  One group is a set of twenty-two workstations split
between ten Fedora workstations and twelve Ubuntu workstations.  The second group is
a set of five servers that serve the Wordpress blogging software.  The last
grouping is a group of five Linux Apache PostgreSQL PHP (LAPP) servers.
Initially all of these groupings contain serious vulnerabilities.
The LAPP servers are running a misconfigured file transfer protocol (FTP) server
and both the LAPP and Wordpress servers both have very simple root passwords
which Nessus shows as a security hole.  The workstations are properly configured
save two that contain multiple security holes.  Both of these workstations are
running outdated versions of the Ubuntu operating system and they have multiple
security holes such as an FTP server that allows a remote user to execute
arbitrary code, misconfigured Windows file sharing software, weak secure shell
(SSH) keys and a Samba server that is vulnerable to buffer overflow attacks.

The Nessus Visualization System draws the administrators attention to the most
grievous security holes by using a darker colored rectangle.  In this example
the Ubuntu workstations are darkly colored because the group contains two
machines with gaping vulnerabilities.  The system also draws the administrators
attention using the size of the rectangle.  In this case the workstations have a
larger square because they contain many security vulnerabilities.  After
patching and updating all of the squares are of similar size and color because
all of the machines are up to date with no vulnerabilities that Nessus
classifies as holes.  

We simulated this use case using virtual machines (VM) networked through a host only
network. Using a host only network allowed us to use Nessus from the host
to scan the VMs.  We used one grouping of two different types of work station
and two groupings of similar servers. Both of the groups of servers were using Ubuntu 10.10 LTS.
Ten of the Ubuntu workstations were using Ubuntu 11.10 while the two workstations
with the massive number of vulnerabilities were using Ubuntu 8.04 (CHECK) with
purposely unatched and misconfigured software.
The Fedora workstations were running Fedora 15.  We used the Metasploitable
virtual machine image to simulate the two vulnerable workstations before they
were upgraded to 11.10.
