var dom = document.getElementById("container");
var myChart = echarts.init(dom);
var app = {};
option = null;

let cities = [{"name":"New York","geo":[-73.9385,40.6643],"ridings":[1487010151917]},{"name":"Los Angeles","geo":[-118.4108,34.0194],"ridings":[1487010151917]},{"name":"Chicago","geo":[-87.6818,41.8376],"ridings":[1487010151917]},{"name":"Houston","geo":[-95.3863,29.7805],"ridings":[1487010151917]},{"name":"Philadelphia","geo":[-75.1333,40.0094],"ridings":[1487010151917]},{"name":"Phoenix","geo":[-112.088,33.5722],"ridings":[1487010151917]},{"name":"San Antonio","geo":[-98.5251,29.4724],"ridings":[1487010151918]},{"name":"San Diego","geo":[-117.135,32.8153],"ridings":[1487010151918]},{"name":"Dallas","geo":[-96.7967,32.7757],"ridings":[1487010151918]},{"name":"San Jose","geo":[-121.8193,37.2969],"ridings":[1487010151918]},{"name":"Austin","geo":[-97.756,30.3072],"ridings":[1487010151918]},{"name":"Jacksonville","geo":[-81.6613,30.337],"ridings":[1487010151918]},{"name":"San Francisco","geo":[-122.4193,37.7751],"ridings":[1487010151918]},{"name":"Indianapolis","geo":[-86.1459,39.7767],"ridings":[1487010151918]},{"name":"Columbus","geo":[-82.985,39.9848],"ridings":[1487010151918]},{"name":"Fort Worth","geo":[-97.3463,32.7795],"ridings":[1487010151918]},{"name":"Charlotte","geo":[-80.8307,35.2087],"ridings":[1487010151918]},{"name":"Seattle","geo":[-122.3509,47.6205],"ridings":[1487010151918]},{"name":"Denver","geo":[-104.8806,39.7618],"ridings":[1487010151918]},{"name":"El Paso","geo":[-106.427,31.8484],"ridings":[1487010151918]},{"name":"Detroit","geo":[-83.1022,42.383],"ridings":[1487010151918]},{"name":"Washington","geo":[-77.0171,38.9041],"ridings":[1487010151918]},{"name":"Boston","geo":[-71.0202,42.332],"ridings":[1487010151918]},{"name":"Memphis","geo":[-89.9785,35.1035],"ridings":[1487010151918]},{"name":"Nashville","geo":[-86.785,36.1718],"ridings":[1487010151918]},{"name":"Portland","geo":[-122.65,45.537],"ridings":[1487010151918]},{"name":"Oklahoma City","geo":[-97.5137,35.4671],"ridings":[1487010151918]},{"name":"Las Vegas","geo":[-115.264,36.2277],"ridings":[1487010151918]},{"name":"Baltimore","geo":[-76.6105,39.3002],"ridings":[1487010151918]},{"name":"Louisville","geo":[-85.6667,38.1781],"ridings":[1487010151918]},{"name":"Milwaukee","geo":[-87.9667,43.0633],"ridings":[1487010151918]},{"name":"Albuquerque","geo":[-106.6474,35.1056],"ridings":[1487010151918]},{"name":"Tucson","geo":[-110.8711,32.1543],"ridings":[1487010151918]},{"name":"Fresno","geo":[-119.7945,36.7827],"ridings":[1487010151918]},{"name":"Sacramento","geo":[-121.4686,38.5666],"ridings":[1487010151918]},{"name":"Kansas City","geo":[-94.5511,39.1252],"ridings":[1487010151918]},{"name":"Long Beach","geo":[-118.1553,33.8091],"ridings":[1487010151918]},{"name":"Mesa","geo":[-111.7174,33.4019],"ridings":[1487010151918]},{"name":"Atlanta","geo":[-84.4227,33.7629],"ridings":[1487010151918]},{"name":"Colorado Springs","geo":[-104.7607,38.8673],"ridings":[1487010151918]},{"name":"Virginia Beach","geo":[-76.024,36.7793],"ridings":[1487010151918]},{"name":"Raleigh","geo":[-78.6414,35.8302],"ridings":[1487010151918]},{"name":"Omaha","geo":[-96.0419,41.2647],"ridings":[1487010151918]},{"name":"Miami","geo":[-80.2086,25.7752],"ridings":[1487010151919]},{"name":"Oakland","geo":[-122.2256,37.7699],"ridings":[1487010151919]},{"name":"Minneapolis","geo":[-93.2683,44.9633],"ridings":[1487010151919]},{"name":"Tulsa","geo":[-95.9023,36.1279],"ridings":[1487010151919]},{"name":"Wichita","geo":[-97.3427,37.6907],"ridings":[1487010151919]},{"name":"New Orleans","geo":[-89.939,30.0686],"ridings":[1487010151919]},{"name":"Arlington","geo":[-97.1247,32.7007],"ridings":[1487010151919]},{"name":"Cleveland","geo":[-81.6795,41.4781],"ridings":[1487010151919]},{"name":"Bakersfield","geo":[-119.0183,35.3212],"ridings":[1487010151919]},{"name":"Tampa","geo":[-82.4797,27.9701],"ridings":[1487010151919]},{"name":"Aurora","geo":[-104.8235,39.7082],"ridings":[1487010151919]},{"name":"Honolulu","geo":[-157.8453,21.3259],"ridings":[1487010151919]},{"name":"Anaheim","geo":[-117.7601,33.8555],"ridings":[1487010151919]},{"name":"Santa Ana","geo":[-117.8826,33.7365],"ridings":[1487010151919]},{"name":"Corpus Christi","geo":[-97.1734,27.7543],"ridings":[1487010151919]},{"name":"Riverside","geo":[-117.3932,33.9381],"ridings":[1487010151919]},{"name":"St. Louis","geo":[-90.2446,38.6357],"ridings":[1487010151919]},{"name":"Lexington","geo":[-84.4584,38.0402],"ridings":[1487010151919]},{"name":"Stockton","geo":[-121.3133,37.9763],"ridings":[1487010151919]},{"name":"Pittsburgh","geo":[-79.9766,40.4398],"ridings":[1487010151919]},{"name":"Saint Paul","geo":[-93.1039,44.9489],"ridings":[1487010151919]},{"name":"Anchorage","geo":[-149.8953,61.2176],"ridings":[1487010151919]},{"name":"Cincinnati","geo":[-84.5064,39.1399],"ridings":[1487010151919]},{"name":"Henderson","geo":[-115.0375,36.0122],"ridings":[1487010151919]},{"name":"Greensboro","geo":[-79.8271,36.0965],"ridings":[1487010151919]},{"name":"Plano","geo":[-96.7479,33.0508],"ridings":[1487010151919]},{"name":"Newark","geo":[-74.1726,40.7242],"ridings":[1487010151919]},{"name":"Toledo","geo":[-83.5819,41.6641],"ridings":[1487010151919]},{"name":"Lincoln","geo":[-96.6804,40.809],"ridings":[1487010151919]},{"name":"Orlando","geo":[-81.2988,28.4159],"ridings":[1487010151919]},{"name":"Chula Vista","geo":[-117.0152,32.6277],"ridings":[1487010151919]},{"name":"Jersey City","geo":[-74.0648,40.7114],"ridings":[1487010151919]},{"name":"Chandler","geo":[-111.8549,33.2829],"ridings":[1487010151919]},{"name":"Fort Wayne","geo":[-85.1439,41.0882],"ridings":[1487010151919]},{"name":"Buffalo","geo":[-78.8597,42.8925],"ridings":[1487010151919]},{"name":"Durham","geo":[-78.9056,35.981],"ridings":[1487010151919]},{"name":"St. Petersburg","geo":[-82.6441,27.762],"ridings":[1487010151919]},{"name":"Irvine","geo":[-117.7713,33.6784],"ridings":[1487010151919]},{"name":"Laredo","geo":[-99.4869,27.5477],"ridings":[1487010151920]},{"name":"Lubbock","geo":[-101.8867,33.5665],"ridings":[1487010151920]},{"name":"Madison","geo":[-89.4301,43.0878],"ridings":[1487010151920]},{"name":"Gilbert","geo":[-111.7422,33.3102],"ridings":[1487010151920]},{"name":"Norfolk","geo":[-76.2446,36.923],"ridings":[1487010151920]},{"name":"Reno","geo":[-119.7765,39.4745],"ridings":[1487010151920]},{"name":"Winston–Salem","geo":[-80.2606,36.1033],"ridings":[1487010151920]},{"name":"Glendale","geo":[-112.1899,33.5331],"ridings":[1487010151920]},{"name":"Hialeah","geo":[-80.3029,25.8699],"ridings":[1487010151920]},{"name":"Garland","geo":[-96.6304,32.9098],"ridings":[1487010151920]},{"name":"Scottsdale","geo":[-111.8237,33.6687],"ridings":[1487010151920]},{"name":"Irving","geo":[-96.97,32.8577],"ridings":[1487010151920]},{"name":"Chesapeake","geo":[-76.3018,36.6794],"ridings":[1487010151920]},{"name":"North Las Vegas","geo":[-115.0893,36.283],"ridings":[1487010151920]},{"name":"Fremont","geo":[-121.9411,37.4944],"ridings":[1487010151920]},{"name":"Baton Rouge","geo":[-91.1259,30.4485],"ridings":[1487010151920]},{"name":"Richmond","geo":[-77.476,37.5314],"ridings":[1487010151920]},{"name":"Boise","geo":[-116.2311,43.5985],"ridings":[1487010151920]},{"name":"San Bernardino","geo":[-117.2953,34.1393],"ridings":[1487010151920]},{"name":"Spokane","geo":[-117.4166,47.6736],"ridings":[1487010151920]},{"name":"Birmingham","geo":[-86.799,33.5274],"ridings":[1487010151920]},{"name":"Modesto","geo":[-120.9891,37.6609],"ridings":[1487010151920]},{"name":"Des Moines","geo":[-93.6167,41.5739],"ridings":[1487010151920]},{"name":"Rochester","geo":[-77.6169,43.1699],"ridings":[1487010151920]},{"name":"Tacoma","geo":[-122.4598,47.2522],"ridings":[1487010151920]},{"name":"Fontana","geo":[-117.4627,34.1088],"ridings":[1487010151920]},{"name":"Oxnard","geo":[-119.2046,34.2023],"ridings":[1487010151920]},{"name":"Moreno Valley","geo":[-117.2057,33.9233],"ridings":[1487010151920]},{"name":"Fayetteville","geo":[-78.9803,35.0851],"ridings":[1487010151921]},{"name":"Huntington Beach","geo":[-118.0093,33.6906],"ridings":[1487010151921]},{"name":"Yonkers","geo":[-73.8674,40.9459],"ridings":[1487010151921]},{"name":"Glendale","geo":[-118.2458,34.1814],"ridings":[1487010151921]},{"name":"Aurora","geo":[-88.2901,41.7635],"ridings":[1487010151921]},{"name":"Montgomery","geo":[-86.2686,32.3463],"ridings":[1487010151921]},{"name":"Columbus","geo":[-84.8749,32.5102],"ridings":[1487010151921]},{"name":"Amarillo","geo":[-101.8287,35.1978],"ridings":[1487010151921]},{"name":"Little Rock","geo":[-92.3586,34.7254],"ridings":[1487010151921]},{"name":"Akron","geo":[-81.5214,41.0805],"ridings":[1487010151921]},{"name":"Shreveport","geo":[-93.7927,32.467],"ridings":[1487010151921]},{"name":"Augusta","geo":[-82.0734,33.3655],"ridings":[1487010151921]},{"name":"Grand Rapids","geo":[-85.6556,42.9612],"ridings":[1487010151921]},{"name":"Mobile","geo":[-88.1002,30.6684],"ridings":[1487010151921]},{"name":"Salt Lake City","geo":[-111.9314,40.7785],"ridings":[1487010151921]},{"name":"Huntsville","geo":[-86.539,34.7843],"ridings":[1487010151921]},{"name":"Tallahassee","geo":[-84.2534,30.4551],"ridings":[1487010151921]},{"name":"Grand Prairie","geo":[-97.021,32.6842],"ridings":[1487010151921]},{"name":"Overland Park","geo":[-94.6906,38.889],"ridings":[1487010151921]},{"name":"Knoxville","geo":[-83.9465,35.9709],"ridings":[1487010151921]},{"name":"Worcester","geo":[-71.8078,42.2695],"ridings":[1487010151921]},{"name":"Brownsville","geo":[-97.4538,26.0183],"ridings":[1487010151921]},{"name":"Newport News","geo":[-76.5217,37.076],"ridings":[1487010151921]},{"name":"Santa Clarita","geo":[-118.5047,34.4049],"ridings":[1487010151921]},{"name":"Port St. Lucie","geo":[-80.3838,27.281],"ridings":[1487010151921]},{"name":"Providence","geo":[-71.4188,41.8231],"ridings":[1487010151921]},{"name":"Fort Lauderdale","geo":[-80.1439,26.1413],"ridings":[1487010151921]},{"name":"Chattanooga","geo":[-85.2471,35.0665],"ridings":[1487010151921]},{"name":"Tempe","geo":[-111.9318,33.3884],"ridings":[1487010151921]},{"name":"Oceanside","geo":[-117.3062,33.2246],"ridings":[1487010151921]},{"name":"Garden Grove","geo":[-117.9605,33.7788],"ridings":[1487010151921]},{"name":"Rancho Cucamonga","geo":[-117.5642,34.1233],"ridings":[1487010151921]},{"name":"Cape Coral","geo":[-81.9973,26.6431],"ridings":[1487010151921]},{"name":"Santa Rosa","geo":[-122.7061,38.4468],"ridings":[1487010151921]},{"name":"Vancouver","geo":[-122.5965,45.6372],"ridings":[1487010151921]},{"name":"Sioux Falls","geo":[-96.732,43.5383],"ridings":[1487010151921]},{"name":"Peoria","geo":[-112.3111,33.7877],"ridings":[1487010151921]},{"name":"Ontario","geo":[-117.6088,34.0395],"ridings":[1487010151921]},{"name":"Jackson","geo":[-90.2128,32.3158],"ridings":[1487010151921]},{"name":"Elk Grove","geo":[-121.3849,38.4144],"ridings":[1487010151921]},{"name":"Springfield","geo":[-93.2913,37.1942],"ridings":[1487010151921]},{"name":"Pembroke Pines","geo":[-80.3404,26.0212],"ridings":[1487010151922]},{"name":"Salem","geo":[-123.0231,44.9237],"ridings":[1487010151922]},{"name":"Corona","geo":[-117.5639,33.8624],"ridings":[1487010151922]},{"name":"Eugene","geo":[-123.1162,44.0567],"ridings":[1487010151922]},{"name":"McKinney","geo":[-96.668,33.2012],"ridings":[1487010151922]},{"name":"Fort Collins","geo":[-105.0648,40.5482],"ridings":[1487010151922]},{"name":"Lancaster","geo":[-118.1753,34.6936],"ridings":[1487010151922]},{"name":"Cary","geo":[-78.8141,35.7821],"ridings":[1487010151922]},{"name":"Palmdale","geo":[-118.109,34.5913],"ridings":[1487010151922]},{"name":"Hayward","geo":[-122.1063,37.6281],"ridings":[1487010151922]},{"name":"Salinas","geo":[-121.6337,36.6902],"ridings":[1487010151922]},{"name":"Frisco","geo":[-96.8193,33.151],"ridings":[1487010151922]},{"name":"Springfield","geo":[-72.54,42.1155],"ridings":[1487010151922]},{"name":"Pasadena","geo":[-95.1505,29.6583],"ridings":[1487010151922]},{"name":"Macon","geo":[-83.396,32.505],"ridings":[1487010151922]},{"name":"Alexandria","geo":[-77.082,38.8183],"ridings":[1487010151922]},{"name":"Pomona","geo":[-117.7613,34.0586],"ridings":[1487010151922]},{"name":"Lakewood","geo":[-105.1176,39.6989],"ridings":[1487010151922]},{"name":"Sunnyvale","geo":[-122.0263,37.3858],"ridings":[1487010151922]},{"name":"Escondido","geo":[-117.0732,33.1336],"ridings":[1487010151922]},{"name":"Kansas City","geo":[-94.7418,39.1225],"ridings":[1487010151922]},{"name":"Hollywood","geo":[-80.1646,26.0311],"ridings":[1487010151922]},{"name":"Clarksville","geo":[-87.3452,36.5664],"ridings":[1487010151922]},{"name":"Torrance","geo":[-118.3414,33.835],"ridings":[1487010151922]},{"name":"Rockford","geo":[-89.0628,42.2634],"ridings":[1487010151922]},{"name":"Joliet","geo":[-88.1584,41.5181],"ridings":[1487010151922]},{"name":"Paterson","geo":[-74.1628,40.9147],"ridings":[1487010151922]},{"name":"Bridgeport","geo":[-73.1957,41.1874],"ridings":[1487010151922]},{"name":"Naperville","geo":[-88.162,41.7492],"ridings":[1487010151922]},{"name":"Savannah","geo":[-81.1536,32.0025],"ridings":[1487010151922]},{"name":"Mesquite","geo":[-96.5924,32.7639],"ridings":[1487010151922]},{"name":"Syracuse","geo":[-76.1436,43.041],"ridings":[1487010151922]},{"name":"Pasadena","geo":[-118.1396,34.1606],"ridings":[1487010151922]},{"name":"Orange","geo":[-117.8249,33.8048],"ridings":[1487010151922]},{"name":"Fullerton","geo":[-117.928,33.8857],"ridings":[1487010151922]},{"name":"Killeen","geo":[-97.732,31.0777],"ridings":[1487010151922]},{"name":"Dayton","geo":[-84.1996,39.7774],"ridings":[1487010151922]},{"name":"McAllen","geo":[-98.2461,26.2185],"ridings":[1487010151922]},{"name":"Bellevue","geo":[-122.1565,47.5978],"ridings":[1487010151922]},{"name":"Miramar","geo":[-80.3358,25.977],"ridings":[1487010151922]},{"name":"Hampton","geo":[-76.2971,37.048],"ridings":[1487010151922]},{"name":"West Valley City","geo":[-112.0118,40.6885],"ridings":[1487010151922]},{"name":"Warren","geo":[-83.025,42.4929],"ridings":[1487010151923]},{"name":"Olathe","geo":[-94.8188,38.8843],"ridings":[1487010151923]},{"name":"Columbia","geo":[-80.8966,34.0298],"ridings":[1487010151923]},{"name":"Thornton","geo":[-104.9454,39.918],"ridings":[1487010151923]},{"name":"Carrollton","geo":[-96.8998,32.9884],"ridings":[1487010151923]},{"name":"Midland","geo":[-102.1097,32.0299],"ridings":[1487010151923]},{"name":"Charleston","geo":[-79.9589,32.8179],"ridings":[1487010151923]},{"name":"Waco","geo":[-97.186,31.5601],"ridings":[1487010151923]},{"name":"Sterling Heights","geo":[-83.0303,42.5812],"ridings":[1487010151923]},{"name":"Denton","geo":[-97.1417,33.2151],"ridings":[1487010151923]},{"name":"Cedar Rapids","geo":[-91.6778,41.967],"ridings":[1487010151923]},{"name":"New Haven","geo":[-72.925,41.3108],"ridings":[1487010151923]},{"name":"Roseville","geo":[-121.3032,38.7657],"ridings":[1487010151923]},{"name":"Gainesville","geo":[-82.3459,29.6788],"ridings":[1487010151923]},{"name":"Visalia","geo":[-119.3234,36.3272],"ridings":[1487010151923]},{"name":"Coral Springs","geo":[-80.2593,26.2708],"ridings":[1487010151923]},{"name":"Thousand Oaks","geo":[-118.8742,34.1933],"ridings":[1487010151923]},{"name":"Elizabeth","geo":[-74.1935,40.6663],"ridings":[1487010151923]},{"name":"Stamford","geo":[-73.546,41.0799],"ridings":[1487010151923]},{"name":"Concord","geo":[-122.0016,37.9722],"ridings":[1487010151923]},{"name":"Surprise","geo":[-112.4527,33.6706],"ridings":[1487010151923]},{"name":"Lafayette","geo":[-92.0314,30.2116],"ridings":[1487010151924]},{"name":"Topeka","geo":[-95.6948,39.0362],"ridings":[1487010151924]},{"name":"Kent","geo":[-122.2169,47.3853],"ridings":[1487010151924]},{"name":"Simi Valley","geo":[-118.7485,34.2669],"ridings":[1487010151924]},{"name":"Santa Clara","geo":[-121.9679,37.3646],"ridings":[1487010151924]},{"name":"Murfreesboro","geo":[-86.4161,35.8522],"ridings":[1487010151924]},{"name":"Hartford","geo":[-72.6833,41.766],"ridings":[1487010151924]},{"name":"Athens","geo":[-83.3701,33.9496],"ridings":[1487010151924]},{"name":"Victorville","geo":[-117.3536,34.5277],"ridings":[1487010151924]},{"name":"Abilene","geo":[-99.7381,32.4545],"ridings":[1487010151924]},{"name":"Vallejo","geo":[-122.2639,38.1079],"ridings":[1487010151924]},{"name":"Berkeley","geo":[-122.2991,37.8667],"ridings":[1487010151924]},{"name":"Norman","geo":[-97.44,35.22],"ridings":[1487010151924]},{"name":"Allentown","geo":[-75.4782,40.594],"ridings":[1487010151924]},{"name":"Evansville","geo":[-87.5347,37.9877],"ridings":[1487010151924]},{"name":"Columbia","geo":[-92.3261,38.9479],"ridings":[1487010151924]},{"name":"Odessa","geo":[-102.3434,31.8804],"ridings":[1487010151924]},{"name":"Fargo","geo":[-96.829,46.8652],"ridings":[1487010151924]},{"name":"Beaumont","geo":[-94.1458,30.0843],"ridings":[1487010151924]},{"name":"Independence","geo":[-94.3513,39.0853],"ridings":[1487010151924]},{"name":"Ann Arbor","geo":[-83.7313,42.2756],"ridings":[1487010151924]},{"name":"El Monte","geo":[-118.0291,34.0746],"ridings":[1487010151924]},{"name":"Springfield","geo":[-89.6708,39.7639],"ridings":[1487010151924]},{"name":"Round Rock","geo":[-97.6674,30.5237],"ridings":[1487010151924]},{"name":"Wilmington","geo":[-77.8858,34.2092],"ridings":[1487010151924]},{"name":"Arvada","geo":[-105.1066,39.8097],"ridings":[1487010151924]},{"name":"Provo","geo":[-111.6448,40.2453],"ridings":[1487010151924]},{"name":"Peoria","geo":[-89.6171,40.7523],"ridings":[1487010151925]},{"name":"Lansing","geo":[-84.5562,42.7098],"ridings":[1487010151925]},{"name":"Downey","geo":[-118.1309,33.9382],"ridings":[1487010151925]},{"name":"Carlsbad","geo":[-117.2828,33.1239],"ridings":[1487010151925]},{"name":"Costa Mesa","geo":[-117.9123,33.6659],"ridings":[1487010151925]},{"name":"Miami Gardens","geo":[-80.2436,25.9489],"ridings":[1487010151925]},{"name":"Westminster","geo":[-105.0644,39.8822],"ridings":[1487010151925]},{"name":"Clearwater","geo":[-82.7663,27.9795],"ridings":[1487010151925]},{"name":"Fairfield","geo":[-122.0397,38.2568],"ridings":[1487010151925]},{"name":"Rochester","geo":[-92.4772,44.0154],"ridings":[1487010151925]},{"name":"Elgin","geo":[-88.3217,42.0396],"ridings":[1487010151925]},{"name":"Temecula","geo":[-117.1246,33.5019],"ridings":[1487010151925]},{"name":"West Jordan","geo":[-112.001,40.6023],"ridings":[1487010151925]},{"name":"Inglewood","geo":[-118.3443,33.9561],"ridings":[1487010151925]},{"name":"Richardson","geo":[-96.7081,32.9723],"ridings":[1487010151925]},{"name":"Lowell","geo":[-71.3221,42.6389],"ridings":[1487010151925]},{"name":"Gresham","geo":[-122.4416,45.5023],"ridings":[1487010151925]},{"name":"Antioch","geo":[-121.7976,37.9775],"ridings":[1487010151925]},{"name":"Cambridge","geo":[-71.1183,42.376],"ridings":[1487010151925]},{"name":"High Point","geo":[-79.9902,35.9855],"ridings":[1487010151925]},{"name":"Billings","geo":[-108.5499,45.7895],"ridings":[1487010151925]},{"name":"Manchester","geo":[-71.4439,42.9847],"ridings":[1487010151925]},{"name":"Murrieta","geo":[-117.1907,33.5719],"ridings":[1487010151925]},{"name":"Centennial","geo":[-104.8691,39.5906],"ridings":[1487010151925]},{"name":"Richmond","geo":[-122.3594,37.953],"ridings":[1487010151925]},{"name":"Ventura","geo":[-119.255,34.2681],"ridings":[1487010151925]},{"name":"Pueblo","geo":[-104.6124,38.2731],"ridings":[1487010151925]},{"name":"Pearland","geo":[-95.2958,29.5544],"ridings":[1487010151925]},{"name":"Waterbury","geo":[-73.0367,41.5585],"ridings":[1487010151925]},{"name":"West Covina","geo":[-117.9099,34.0559],"ridings":[1487010151925]},{"name":"North Charleston","geo":[-80.0169,32.8853],"ridings":[1487010151925]},{"name":"Everett","geo":[-122.1742,48.0033],"ridings":[1487010151925]},{"name":"College Station","geo":[-96.3144,30.6013],"ridings":[1487010151925]},{"name":"Palm Bay","geo":[-80.6626,27.9856],"ridings":[1487010151925]},{"name":"Pompano Beach","geo":[-80.129,26.2426],"ridings":[1487010151925]},{"name":"Boulder","geo":[-105.2797,40.0175],"ridings":[1487010151925]},{"name":"Norwalk","geo":[-118.0834,33.9069],"ridings":[1487010151925]},{"name":"West Palm Beach","geo":[-80.1266,26.7483],"ridings":[1487010151925]},{"name":"Broken Arrow","geo":[-95.781,36.0365],"ridings":[1487010151925]},{"name":"Daly City","geo":[-122.465,37.7009],"ridings":[1487010151926]},{"name":"Sandy Springs","geo":[-84.227,33.5615],"ridings":[1487010151926]},{"name":"Burbank","geo":[-118.3249,34.189],"ridings":[1487010151926]},{"name":"Green Bay","geo":[-87.9842,44.5207],"ridings":[1487010151926]},{"name":"Santa Maria","geo":[-120.4438,34.9332],"ridings":[1487010151926]},{"name":"Wichita Falls","geo":[-98.5259,33.9067],"ridings":[1487010151926]},{"name":"Lakeland","geo":[-81.9589,28.0411],"ridings":[1487010151926]},{"name":"Clovis","geo":[-119.4211,36.4931],"ridings":[1487010151926]},{"name":"Lewisville","geo":[-97.0061,33.0383],"ridings":[1487010151926]},{"name":"Tyler","geo":[-95.3,32.35],"ridings":[1487010151926]},{"name":"El Cajon","geo":[-116.9605,32.8017],"ridings":[1487010151926]},{"name":"San Mateo","geo":[-122.3131,37.5542],"ridings":[1487010151926]},{"name":"Rialto","geo":[-117.3883,34.1118],"ridings":[1487010151926]},{"name":"Edison","geo":[-74.3494,40.504],"ridings":[1487010151926]},{"name":"Davenport","geo":[-90.604,41.5541],"ridings":[1487010151926]},{"name":"Hillsboro","geo":[-122.9833,45.5167],"ridings":[1487010151926]},{"name":"Woodbridge","geo":[-74.2926,40.5608],"ridings":[1487010151926]},{"name":"Las Cruces","geo":[-106.7653,32.3197],"ridings":[1487010151926]},{"name":"South Bend","geo":[-86.269,41.6769],"ridings":[1487010151926]},{"name":"Vista","geo":[-117.2411,33.1936],"ridings":[1487010151926]},{"name":"Greeley","geo":[-104.7167,40.4167],"ridings":[1487010151926]},{"name":"Davie","geo":[-80.2803,26.0814],"ridings":[1487010151926]},{"name":"San Angelo","geo":[-100.45,31.45],"ridings":[1487010151926]},{"name":"Jurupa Valley","geo":[-117.4706,33.0011],"ridings":[1487010151926]},{"name":"Renton","geo":[-122.1953,47.4867],"ridings":[1487010151926]}];


function init(){
  cities.every((city, index) => {
  city.riding = city.ridings[0];
  delete city.ridings;
  // city.geo = JSON.stringify(city.geo);
  if(index > 3) return false;
  $.ajax({
    url: '/statistics/ridingsAmount/',
    method: 'POST',
    data: JSON.stringify(city),
    dataType: 'json',
    contentType: "application/json; charset=utf-8",
    success: (result) => {
      console.log(result);
    },
    error: () => {

    }
  });

  return true
});
}

// init();

var geoCoordMap = {
  'La Crosse': [-91.2, 43.8],
  'New York': [-74.006, 40.714],
  'Los Angeles': [-118.244, 34.052],
  'Chicago': [-87.65, 41.85],
  'Houston': [-95.363, 29.763 ]
};

var convertData = function(data) {
  var res = [];
  for (var i = 0; i < data.length; i++) {
    var geoCoord = data[i].geo;
    if (geoCoord) {
      res.push({
        name: data[i].name,
        value: geoCoord.concat(data[i].value)
      });
    }
  }
  return res;
};

function draw(start, end) {
  $.get({
    url: `/statistics/ridingsAmount?start=${start}&end=${end}`,
    success: (result) => {
      let data = result.data;
      let total = 0;
      data.forEach((city) => {
        total += city.value;
      });
      let scale = 10 / (total / data.length);
      $.get('/admin/data/USA.json', function(usaJson) {
        myChart.hideLoading();

        echarts.registerMap('USA', usaJson, {
          Alaska: { // 把阿拉斯加移到美国主大陆左下方
            left: -131,
            top: 25,
            width: 15
          },
          Hawaii: {
            left: -110, // 夏威夷
            top: 28,
            width: 5
          },
          'Puerto Rico': { // 波多黎各
            left: -76,
            top: 26,
            width: 2
          }
        });
        option = {
          backgroundColor: '#404a59',
          title: {
            text: '',
          //   subtext: 'data from PM25.in',
          //   sublink: 'http://www.pm25.in',
            left: 'center',
            textStyle: {
              color: '#fff'
            }
          },
          tooltip: {
            trigger: 'item'
          },
          legend: {
            orient: 'vertical',
            y: 'bottom',
            x: 'right',
            data: ['pm2.5'],
            textStyle: {
              color: '#fff'
            }
          },
          geo: {
            map: 'USA',
            silent: true,
            label: {
              emphasis: {
                show: false,
                areaColor: '#eee'
              }
            },
            itemStyle: {
              normal: {
                borderWidth: 0.2,
                borderColor: '#404a59'
              }
            },
            roam: true,
            // itemStyle: {
            //     normal: {
            //         areaColor: '#323c48',
            //         borderColor: '#111'
            //     },
            //     emphasis: {
            //         areaColor: '#2a333d'
            //     }
            // }

          },
          series: [{
              name: 'Ridings',
              type: 'scatter',
              coordinateSystem: 'geo',
              data: convertData(data),
              symbolSize: function(val) {
                return val[2] *scale;
              },
              label: {
                normal: {
                  formatter: '{b}',
                  position: 'right',
                  show: false
                },
                emphasis: {
                  show: true
                }
              },
              itemStyle: {
                  normal: {
                      borderColor: '#fff',
                      color: '#577ceb',
                      opacity: .6,
                  }
              }
            },
            {
              name: 'Top 3',
              type: 'effectScatter',
              coordinateSystem: 'geo',
              data: convertData(data.sort(function(a, b) {
                return b.value - a.value;
              }).slice(0, 3)),
              symbolSize: function(val) {
                return val[2] *scale;
              },
              showEffectOn: 'render',
              rippleEffect: {
                brushType: 'stroke'
              },
              hoverAnimation: true,
              label: {
                normal: {
                  formatter: '{b}',
                  position: 'right',
                  show: true
                }
              },
              itemStyle: {
                normal: {
                  borderColor: '#fff',
                  color: '#577ceb',
                  opacity: .6,
                }
              },
              zlevel: 1
            }
          ]
        };
        if (option && typeof option === "object") {
          myChart.setOption(option, true);
        }
      });
    }
  });
}

$(document).ready(function() {
  $('select').material_select();
  let curr = new Date().getTime();
  draw(curr - 24 * 3600 * 1000, curr);

  $('select').on('change', function() {
    // console.log($(this).val());
    draw(curr - $(this).val() * 3600 * 1000, curr);
  });
});