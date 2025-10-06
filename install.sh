 #!/usr/bin/env bash

DIA=""
DIA_ESC=""

function initialise() {
t(){ type "$1"&>/dev/null;}
while :; do
t whiptail && DIA=whiptail && break
t dialog && DIA=dialog && DIA_ESC=-- && break
echo "No dialog program found. Please install dialog or whiptail."
exit 1
break
done;
}

function Menu.Show {
declare -A o="$1"; shift
   $DIA --backtitle "${o[backtitle]}" --title "${o[title]}" \
      --menu "${o[question]}" 0 0 0 $DIA_ESC "$@"  3>&1 1>&2 2>&3
}
 

initialise

while :; do
opt=$(Menu.Show '([backtitle]="Backtitle"
            [title]="Title"
            [question]="Please choose:")'          \
                                                    \
            "1"  "Open shell inside container"                \
            "2"  "View logs"                \
            "Option C"  "Stuff...."  )
echo $opt
if [ -z "$opt" ]; then
  echo "Goodbye"
  exit 0
  break
fi

case "$opt" in
1) 
clear
docker exec -i -t vopidy-dev /bin/bash
;;
2) 
clear
docker exec -i -t vopidy-dev /usr/local/bin/pm2 logs
;;
esac

done
