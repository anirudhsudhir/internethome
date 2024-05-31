rm -rf anna internethome
git clone https://github.com/anna-ssg/anna
git clone https://github.com/anirudhsudhir/internethome.git
cd anna/
go build
rm -rf site/
cp -r ../internethome/site/ ./
./anna
cp -r ./site ../
cd ../


# curl -L https://github.com/acmpesuecc/anna/releases/download/v2.0.0/anna_Linux_x86_64.tar.gz > anna_Linux_x86.tar.gz
# tar -xvzf anna_Linux_x86.tar.gz
# ./anna
