## Use Cases

We envision our system being useful for two types of use cases.  The first is
analyzing the current vulnerabilities associated with machines on a network.
This use case is to allow a system administrator to prioritize maintenance based
on the value of the machines and the criticality of the vulnerabilities found on
those machines using data from Nessus scans.  The second use case is visualizing 
the changes to the vulnerability states of machines on a network after a system
administrator performs maintenance.

### Static Vulnerability State Network

To test visualizing the static vulnerability state we use Nessus scan data from
the VAST Challenge 2011. This data is from a simulated network for the
fictitious All Freight Corporation.  This data set has more than one hundred
fifty unique IP addresses from All Freight Corporation's various servers, firewalls and
workstations.  The majority of All Freight Corporation's
machines can be grouped into either their data center,  their office
workstations or external web servers.  Most all of the machines are running a
version of Microsoft Windows with the servers running Windows Server 2008.
The Nessus scan shows that numerous
machines on the network have some sort of security hole such as incorrectly
configured telnet client, a font driver that allows privilege escalation and a
vulnerability in an outdated version of Microsoft Excel. 

| Name         | IP Addresses| Security Notes | Security Holes |
|:------------:|:-----------:|:--------------:|:--------------:|
| Data Center  | 192.168.1.x | 10             | 0              |
| Workstations | 192.168.2.x | 556            | 919            |

### Dynamic Vulnerability State Network

The second use case for our system is to make it easier for administrators to
visualize that state of machines on a network before and after maintenance. 
The grouping functionality allows
the administrator to group together related machines by subnet, purpose of
functionality.  In this example virtual system machines are grouped into three
different categories.  One group is a set of twenty-two workstations split
between ten Fedora workstations and twelve Ubuntu workstations.  The second group is
a set of five servers that serve the Wordpress blogging software.  The last
grouping is a group of five Linux Apache PostgreSQL PHP (LAPP) servers.
Initially all of these groupings contain serious vulnerabilities.
The LAPP servers are running a poorly configured file transfer protocol (FTP) server
and both the LAPP and Wordpress servers both have very simple root passwords
which Nessus shows as a security hole.  The majority of the workstations are properly configured
save for two that contain multiple security holes.  Both of these workstations are
running outdated versions of the Ubuntu operating system and have
vulnerabilities such as an FTP server that allows a remote user to execute
arbitrary code, an incorrectly configured Windows file sharing software, weak secure shell
(SSH) keys and a Samba server that is vulnerable to buffer overflow attacks.

The Nessus Visualization draws the administrators attention to the most
grievous security holes by using a darker colored rectangle.  In this example
the Ubuntu workstations are darkly colored because the group contains two
machines with gaping vulnerabilities.  The system also draws the administrators
attention using the size of the rectangle.  In this case the workstations have a
larger square because they contain many security vulnerabilities.

In this use case we did not patch all security notes that Nessus mentions
because this would not be realistic for an actual system administrator.  Instead
the system administrator would handle the most important vulnerabilities and
system updates.  In this simulated use case we improved the weak root passwords
and removed the poorly configured FTP on the servers.  We focused on updating
and correcting the two most vulnerable workstations by making them up to date
with the other ten Ubuntu machines.

We simulated this use case using virtual machines (VM) networked through a host only
network. Using a host only network allowed us to use Nessus from the host
to scan the VMs.  We used one grouping of two different types of work station
and two groupings of similar servers. Both of the groups of servers were using Ubuntu 10.10 LTS.
Ten of the Ubuntu workstations were using Ubuntu 11.10 while the two workstations
with the massive number of vulnerabilities were using Ubuntu 8.04 (CHECK) with
purposely unpatched and misconfigured software.
The Fedora workstations were running Fedora 15.  We used the Metasploitable
virtual machine image to simulate the two vulnerable workstations before they
were upgraded to 11.10.

| Name              | IP Addresses | Time period    |  Security Notes | Security Holes |
|:-----------------:|:------------:|:---------------|:---------------:|:--------------:|
| Workstations      | 192.168.56.x | Before Patches | 680             | 18             |
|                   |              | After Patches  | 507             | 0              |
| LAPP Servers      | 192.168.57.x | Before Patches | 205             | 5              |
|                   |              | After Patches  | 200             | 0              |
| Wordpress Servers | 192.168.58.x | Before Patches | 195             | 5              |
|                   |              | After Patches  | 195             | 0              |

