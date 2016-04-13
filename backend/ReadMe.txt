


How to install Node JS and NPM (Node Package Manager)
=====================================================

sudo yum install gcc-c++ make
sudo yum install openssl-devel
sudo yum install git
git clone https://github.com/nodejs/node.git
cd node

To install specific node version execute below two steps
===================
git tag -l (lists tags , will list various node versions available)
git checkout v4.4.2 (mention specific node version)
===================

./configure
make
sudo make install


node -v (To check installed node version)
npm list or npm list --depth=0 (To check node packages installed)










