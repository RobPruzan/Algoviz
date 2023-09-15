## WSL Setup Guide for Ubuntu 22.04 LanzaTech Dev

### Introduction

A step-by-step guide for setting up a WSL (Windows Subsystem for Linux) instance with Ubuntu 22.04 for LanzaTech development.

### Prerequisites

- Windows 10 or later with WSL enabled
- Ubuntu 22.04 LanzaTech Dev image
- How to use a basic text editor via the terminal, this guide uses vim, but you can use any other text editor you prefer

### Steps

#### 1. Find the file of the downloaded image

- Navigate to your downloads folder

#### 2. Import the downloaded WSL Instance

`wsl --import <InstanceName> <outputpath> Ubuntu-22.04-LanzaTech-Dev`
Example: `wsl --import Ubuntu-22.04-LanzaTech-Dev . Ubuntu-22.04-LanzaTech-Dev`

#### 3. Access the Instance

`wsl -d <InstanceName>`

#### 4. Confirm Temporary User

`whoami` (Should display 'tempuser')

#### 5. Run Setup Script

`cd ~/scripts/`
`sudo ./setup.sh` Enter lanzatech.2243 if prompted for password
Enter new username & password for your linux profile when prompted from script

#### 6. Switch to New User

` su - <new-username>`` Use new password if prompted `

#### 7. Run Link Script

`cd ~/scripts`
`./link.sh` Enter new-user password if prompted

#### 8. Source Zsh Config

`source ~/.zshrc`

#### 9. Change Root Password

`su -` Enter temp-root-password if prompted
`passwd` Change root password, enter temp-root-password if prompted for password before changing

#### 10. Update Default User in WSL Config

`vim /etc/wsl.conf`
Change default=tempuser to default=your-new-username

#### 11. Edit Zsh Theme

`su - <new-user>`
`vim ~/.zshrc` Change from the theme from robbyrussell to powerlevel10k/powerlevel10k

#### 12. Reload Zsh with New Config

`exec zsh` PowerShell config wizard should start

## Postgresql

#### 1. Start postgresql service

```
$ sudo service postgresql start
 * Starting PostgreSQL 15 database server
```

#### 2. Create a new user

```
$ sudo -u postgres psql

postgres=# CREATE USER <username> PASSWORD '<password>'
```

#### 3. Get host for DB connections

```
$ hostname -I
```

#### 4. Verify we can connect via hostname

```
 psql -U <username> -d postgres -h $(hostname -I)

 postgres=#
```

- When connecting to database connectors, you should use the host, username and password from the previous step.

### Connecting to the WSL instance via VsCode

##### 1. Install the Remote - WSL extension

##### 2. press the key combination: command/ctrl + shift + p

##### 3. type: '> WSL: Connect to WSL using Distro'

##### 4. Select the WSL instance you want to connect to
