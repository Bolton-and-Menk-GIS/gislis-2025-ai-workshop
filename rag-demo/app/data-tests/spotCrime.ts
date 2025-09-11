
const apiKey = 'SFMyNTY.g2gDbQAAADE3NS43My4xMjAuNjk6N2ZkODVjNDctNTE5Ny00NDMzLTk0YzctMDRjOGZlZjhhMjMwbgYAZuWiNZkBYgABUYA.ntp32-VAPLxGm6L1VECNG1A0YWDIEqxtjU89o_tV6qQ'

const referer = 'https://spotcrime.com/map?lat=44.7973962&lon=-93.5272861&address=Shakopee,%20MN,%20USA'
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'

const url = 'https://spotcrime.com/crimes.json?lat=44.7973962&lon=-93.5272861&radius=0.02'

const test = async () => {
    const response = await fetch(url, {
        headers: {
            'Spotcrime-Api-Token': apiKey,
            'referer': referer,
            'User-Agent': userAgent
        }
    });
   
    const jsonData = await response.json();
    console.log(jsonData);
  }

  void test()