/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

// DO NOT EDIT THIS GENERATED OUTPUT DIRECTLY!
// This file should be overwritten as part of your build process.
// If you need to extend the behavior of the generated service worker, the best approach is to write
// additional code and include it using the importScripts option:
//   https://github.com/GoogleChrome/sw-precache#importscripts-arraystring
//
// Alternatively, it's possible to make changes to the underlying template file and then use that as the
// new base for generating output, via the templateFilePath option:
//   https://github.com/GoogleChrome/sw-precache#templatefilepath-string
//
// If you go that route, make sure that whenever you update your sw-precache dependency, you reconcile any
// changes made to this original template file with your modified copy.

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren, quotes, comma-spacing */
'use strict';

var precacheConfig = [["fonts/museo300.woff2","77d91f5c3a2108bb52b452c50215a8db"],["fonts/museo700.woff2","9a7e0dfa7ce37284551fa609481007f2"],["images/cryptos/act.svg","283e49272520b2569b5abcb958161f99"],["images/cryptos/ada.svg","1e8fc592aea4a224b5318c205d0e1b91"],["images/cryptos/adx.svg","eaf4aaca70d519f5be2d2daa7d51ace5"],["images/cryptos/ae.svg","a119517414d9aecd403cf19e80d34d4c"],["images/cryptos/agi.svg","b3f0239e46b7ca1d784aea64414c3e50"],["images/cryptos/aion.svg","326eab4c16384a3b5c3d7f9fd2d7bee1"],["images/cryptos/amb.svg","6736758039de280126c946e71cad4d7d"],["images/cryptos/amp.svg","95a2d8baada7c2a081633b97eeccbe97"],["images/cryptos/ant.svg","7afd743b63622a4c112a80eaf840bbdd"],["images/cryptos/appc.svg","df667ac0972e02f6d6539b8de2a339fa"],["images/cryptos/ardr.svg","7ab213e968c8028adf224e55fd57618f"],["images/cryptos/ark.svg","e7719deb823b5248c691e70410e71a5f"],["images/cryptos/arn.svg","0339475c80ce67cfb0c9689bc605e454"],["images/cryptos/ast.svg","104216f19aa5fe086b5bac0593177595"],["images/cryptos/atm.svg","0f1d9db05dcfeb5e870847b8b1f63781"],["images/cryptos/bat.svg","fc6a5468f696b6a3c6084a2ba4708744"],["images/cryptos/bay.svg","c01d23c19b3c7d6e2e66e8183ab8998f"],["images/cryptos/bcc.svg","bf4b9987ee023f231b3c4a3b5ad6853f"],["images/cryptos/bcd.svg","b951d782ceca31654b611b87b401fee0"],["images/cryptos/bch.svg","52f348b2794c6a3a651153db24a06ec7"],["images/cryptos/bcn.svg","fbfb8c5a737697986383b29016502500"],["images/cryptos/bco.svg","3dbfb2723a78fe2986f32a299e73a402"],["images/cryptos/bcpt.svg","af11612c4524f564c3739ec210523126"],["images/cryptos/bdl.svg","902a4139ecfd2a8cf63f0b2b08ae3962"],["images/cryptos/bela.svg","2675c4d19449a0cfb85bf2007f22a485"],["images/cryptos/blcn.svg","b14388c18a3bea6bff9d8791b4cec3d5"],["images/cryptos/blk.svg","6f1d97110cc625d52b7b60882e4c1e2c"],["images/cryptos/block.svg","567b4933999a95fa9d150ca0c8c3ea9a"],["images/cryptos/bnb.svg","f78cb0ac9030a7bec8aec4de2645b1fc"],["images/cryptos/bnt.svg","5dd9ca28a856d47fe726525c4672d821"],["images/cryptos/bnty.svg","ff5d9acf1ece1ac18fc4f89309ac9ad6"],["images/cryptos/bpt.svg","40c5aebdfece9236ece1fa54cd091d94"],["images/cryptos/bq.svg","ccb017fc2ae6007b0194213f3d85fc91"],["images/cryptos/bqx.svg","495f9a4d9f1ed67464ec52fa93fac9eb"],["images/cryptos/btc.svg","e73cb1b222d746763a3d57ab92c94621"],["images/cryptos/btcd.svg","8586e60f2bb7f85155121e733cb2cd10"],["images/cryptos/btcz.svg","725dca048a37abff6ccfd945ce8b51a3"],["images/cryptos/btg.svg","3de967b8147cf24a401f67e7a1238c99"],["images/cryptos/btm.svg","985d8c977cc01178bb55e9fb3ca36827"],["images/cryptos/bts.svg","a34280a2a76a5f7faeded381e20ac023"],["images/cryptos/btx.svg","3fefaa7a8a374869c0d8fd6dad8b1353"],["images/cryptos/burst.svg","791c2006f4e20d27f2fafa45d2230631"],["images/cryptos/cdn.svg","a38204796e25393c6563c7d3873747d9"],["images/cryptos/cdt.svg","007dcc51fd4578b1dd9c6e5e6a46b1cf"],["images/cryptos/clam.svg","4c9c574345e49b16b18c3e8b7321a4bd"],["images/cryptos/cloak.svg","506cf330b6dc6058804f5249dcd8fa8b"],["images/cryptos/cnd.svg","ca2d1910154d528c19825f0070c76113"],["images/cryptos/cnx.svg","8767471d4650e7ef54011ccbf0a631f7"],["images/cryptos/cny.svg","5bb0dfefb721babb621198465d54de34"],["images/cryptos/cred.svg","37952c78f54355915949e5608e24aa9e"],["images/cryptos/crpt.svg","eef2e80388bcd197fd474a6024b6d7a2"],["images/cryptos/cvc.svg","fc682f212b771ede0c0a268e781e0614"],["images/cryptos/dash.svg","642951df15183716cd0e0093e3a39ce9"],["images/cryptos/dat.svg","352dfa155fe454ddbf59e77625770abf"],["images/cryptos/data.svg","2da187ed7a26ed365489ee7ef8ac6e2c"],["images/cryptos/dbc.svg","04ae11a32b2f11d14740a69c763e616a"],["images/cryptos/dcn.svg","24747021e0bf8d63e85b51c87c175ddc"],["images/cryptos/dcr.svg","105193efd5039caef06c8a75a85855d7"],["images/cryptos/default.svg","001ad2accf9c1ef4e78f6c02992efdec"],["images/cryptos/dent.svg","b767bce1f4cd9d710d54b42c0ab9e624"],["images/cryptos/dgb.svg","04b7634670706ed8e81a2cf59e199769"],["images/cryptos/dgd.svg","017d2acbddc68174f8efe4b179fcfbe5"],["images/cryptos/dlt.svg","b10d9f69b83b27cc3069cbabe0c02790"],["images/cryptos/dnt.svg","31775f794779d69e4bb892f4d681d1bb"],["images/cryptos/doge.svg","23ff3cf08e15fc24cd74b146c176f12d"],["images/cryptos/drgn.svg","472972edc778b16c7c68ab86cf3e8175"],["images/cryptos/ebst.svg","bfa0ab10535fc878d1c1fc3556e5f13f"],["images/cryptos/edg.svg","c7dcc793fcdcd55973d28a5471e0b3ee"],["images/cryptos/edoge.svg","1501e8ddd58c0328c339bd0eb7830b40"],["images/cryptos/elf.svg","db15f9400d0308c2d59ea64692bdc445"],["images/cryptos/elix.svg","ffaef9078275016c95a9482db28b1c46"],["images/cryptos/ella.svg","8d79bdfbd6ef948e349d0a9b5bd7cd86"],["images/cryptos/emc.svg","522e0622405e23fe03adaa2963f49858"],["images/cryptos/emc2.svg","f3500488aa18b1f340d80b6fbf76da20"],["images/cryptos/eng.svg","6e0ab72d034b4aa18e100e6a7c80ae4c"],["images/cryptos/enj.svg","764cb42fd9dd8e47b255169cf457a208"],["images/cryptos/eos.svg","d431754f66fcced10457921c2ecd8627"],["images/cryptos/etc.svg","0661d458a381a16f604b565d5ca6128e"],["images/cryptos/eth.svg","18708d3e3f54116e2ea639fdd56dd6c5"],["images/cryptos/ethos.svg","011ebf7c00b6fec8d5401d47cb8255cf"],["images/cryptos/etn.svg","09934d701bf7875855680b1c287a18f2"],["images/cryptos/etp.svg","15151d66234f1fc93dd2282482b71eb3"],["images/cryptos/eur.svg","2430516b3987d13292066e91dabdfa41"],["images/cryptos/evx.svg","ffe1afa6a7335293b8e70c90e41d47ff"],["images/cryptos/exmo.svg","d6cb3af62232c9aab61aab6b47f58f0b"],["images/cryptos/exp.svg","17140e2d2c43751a0023f6f885808ddd"],["images/cryptos/fair.svg","a67a68a35a0c23f367926e2c443fc805"],["images/cryptos/fct.svg","d4ca69913ca89631e8598239c887ede9"],["images/cryptos/fil.svg","7e92570d2af3ee7c207a5b7b5f0086de"],["images/cryptos/fldc.svg","1313fb9a241dc239cc674f0f9fcd0143"],["images/cryptos/flo.svg","620286ca2c5ac83e1aff34b4ea040edd"],["images/cryptos/ftc.svg","d07a0a016efd8ccede880f7c7dfe3b2e"],["images/cryptos/fuel.svg","c7d653d6d86479a313efeb113dda9614"],["images/cryptos/fun.svg","9700c77d91fea1a48b6db8779ac260f3"],["images/cryptos/game.svg","9b49c996076fb4ff9cdac334b64a7cc9"],["images/cryptos/gas.svg","be04f15cb31e13ea3773d64d9f356ef6"],["images/cryptos/gbp.svg","cd34f235484031feb7acc5568af24048"],["images/cryptos/gbx.svg","bc5f38cc0ba22ba93d63934f8dfc1e79"],["images/cryptos/gbyte.svg","e58a6b870fe312fd39749e4e10b8875f"],["images/cryptos/gno.svg","bfca5fa32cffd59e8c8e7ac23dc06b7d"],["images/cryptos/gnt.svg","e6f580bc393013fe240cb5345e7d0a28"],["images/cryptos/grc.svg","2287f090f77a03c6aa376f5235638de5"],["images/cryptos/grs.svg","853ebde7b3019ef9aeec0d220697ef57"],["images/cryptos/gto.svg","ef336f899cc1b8a561ceb4ec6ba31b06"],["images/cryptos/gup.svg","a603fdfad1c5fce021f806bb120f44bf"],["images/cryptos/gvt.svg","1bdab0fe75716fa03c13bd22ea3f81f0"],["images/cryptos/gxs.svg","2a10d110050c6055e233989db41b493e"],["images/cryptos/hpb.svg","1fda450070dbbec0e468da4d28a382f6"],["images/cryptos/hsr.svg","3754ba9bc40fc0abb1d2d6207a61843b"],["images/cryptos/huc.svg","63f3ee8589351d0965cce69966483455"],["images/cryptos/hush.svg","c4cb1783aa7929a4c17454e60259f9ae"],["images/cryptos/icn.svg","db897f350cb6dcc7db0fa74a83479923"],["images/cryptos/icx.svg","9cce8b06fa10167c710168b0c7fee17c"],["images/cryptos/ignis.svg","8ab7255dcc6f5b58d1bc632e3ae75838"],["images/cryptos/ins.svg","1beb3f504ea2f74dbe9e6bdb94b84426"],["images/cryptos/iop.svg","dec477a300fcdf4c06dd2593019b1741"],["images/cryptos/iost.svg","34c0963c5d2fb322f3b717573065aead"],["images/cryptos/jpy.svg","91f2439da987c7ddf584e732c4f34cab"],["images/cryptos/kcs.svg","95481ecbb8b022cc5538e995b27620c7"],["images/cryptos/kin.svg","7b6658fd1fe27050d832a4514df5ed8c"],["images/cryptos/kmd.svg","35fa22e37ae568b1f1ae8ab5ce5e6bb1"],["images/cryptos/knc.svg","64f17b406f953524fb3ee0be2d532655"],["images/cryptos/krb.svg","bb3cbe7e93680186814cfd049e12f66d"],["images/cryptos/lbc.svg","900dfc2b8628ea62b58b87bed69d9336"],["images/cryptos/lend.svg","0916c5d8ad8e396b72b8bee30701fcde"],["images/cryptos/link.svg","a3f7f5aac60bdb5bf36fe187ecdabc3c"],["images/cryptos/lkk.svg","3ceff927b79ecf22d10ab823cf555909"],["images/cryptos/lrc.svg","cb11a1c2a214f53dd4eb75e0d0672c2c"],["images/cryptos/lsk.svg","c1a009bfa433667d5d12fc0db4ed04a9"],["images/cryptos/ltc.svg","400f27fe7b5953b64b90ee38ed13b92b"],["images/cryptos/lun.svg","ee3e5a731aa6bacad02cf9a8071acba8"],["images/cryptos/maid.svg","159bededef0836d847b6fca82dbeb584"],["images/cryptos/mana.svg","45564423187416080685cfc08eb4d2dd"],["images/cryptos/mcap.svg","4802b607b004f064b66d86f89b7707fe"],["images/cryptos/mco.svg","ce438187d28f9ebe725d5026f956157d"],["images/cryptos/med.svg","ff6263037ce4cd6e9ef9eb0c79fb6ee3"],["images/cryptos/miota.svg","425367edd2376cec8ae934f820e907c4"],["images/cryptos/mkr.svg","242f29f38b3dd8d5ce69061ef2acc4a4"],["images/cryptos/mln.svg","70e22075bb820dc9a8b8a302afd40180"],["images/cryptos/mnx.svg","04163ce6e006695c0fbc6bfe77f190a6"],["images/cryptos/mona.svg","4196ab197bb04dd331d94843f53fab45"],["images/cryptos/mth.svg","1bcd602e0f04908753270dfdfc27e8d0"],["images/cryptos/mtl.svg","9cb2df25c34f809024e129fb3b4d56fe"],["images/cryptos/music.svg","96c4a5d07ef687cd38b72c19e1ea1f5a"],["images/cryptos/nas.svg","3e106b2ec4ed152663d002ca8fd0a1c5"],["images/cryptos/nav.svg","d779b1347900437511f0bb6df7cd9183"],["images/cryptos/ndz.svg","680e50883393d816328eda5510534986"],["images/cryptos/nebl.svg","dc47dc4a099d07848893c5110a47dc88"],["images/cryptos/neo.svg","1df7e53491dec1baff20bb8635905bb4"],["images/cryptos/neos.svg","8d99f6133885d63e4a9ea4605a0c4681"],["images/cryptos/ngc.svg","910bae68b9ec3303c80f09243f9ab074"],["images/cryptos/nlc2.svg","9eeb0b7d3f4540204e136d463cf646ab"],["images/cryptos/nlg.svg","3f460e4eafe012f0959301fe8823099e"],["images/cryptos/nmc.svg","5d98e0aeb1a2feeb1ec2dae47e24c90f"],["images/cryptos/nxs.svg","4111022cf769a2173b6d771bddebac85"],["images/cryptos/nxt.svg","02157f7c399ed10399129d0494c07813"],["images/cryptos/oax.svg","83fcbcd47094538cc11793dcb7f0798a"],["images/cryptos/omg.svg","e6374d9a7468ee81cc5dce7921a7c42a"],["images/cryptos/omni.svg","b6bd613c197230b8f8ccefdcba102da6"],["images/cryptos/ost.svg","27e956154646dc8fdabc21cfff5d1c58"],["images/cryptos/ox.svg","b5d6d086d34460cc74cef51a68572706"],["images/cryptos/pac.svg","bfbfdd81b26b7012b09f2eeda652770a"],["images/cryptos/part.svg","4471abbefc2ecba5ce6e1ee7cc554d51"],["images/cryptos/pasl.svg","ae02d4c36058e354ae147fd120c41b5d"],["images/cryptos/pay.svg","eff99aa0c07af153aaa88c9381335685"],["images/cryptos/pink.svg","6cdce66f1e8ebe6331f18d9a2121bf38"],["images/cryptos/pirl.svg","fd5a25bd5b225b8d464010595e3c121a"],["images/cryptos/pivx.svg","782df35dc138d5b130b90af2ec8fc65e"],["images/cryptos/plr.svg","51ca651644c0dff40f2af052be4f0831"],["images/cryptos/poe.svg","0d5781014f4f146b8e036b5af8e45ef1"],["images/cryptos/poly.svg","0423fad06783cd1989eebc0f3033eb7d"],["images/cryptos/pot.svg","af9ffa473c5552da3c90d94ebf5b9174"],["images/cryptos/powr.svg","e2ecdd8c84c8000ba0134150baccc5b5"],["images/cryptos/ppc.svg","40531ccfee0cedaf6b6cbe6f4db0147f"],["images/cryptos/ppp.svg","eabee6ce40205546ceded4bc9a6d0177"],["images/cryptos/ppt.svg","6cabb95392d38c8ad181d6570a7d6adf"],["images/cryptos/prl.svg","f0948417829a905d18bc429851676294"],["images/cryptos/pura.svg","7612a579125702a6152207644088eb3f"],["images/cryptos/qash.svg","8c06f6e6566ccaa5d417a35807519224"],["images/cryptos/qiwi.svg","015eb156461fb0a63a7827ff215c4260"],["images/cryptos/qlc.svg","ddf01ee1d4d439fa5e05a599cb14ee29"],["images/cryptos/qsp.svg","4ea1e5075b235c2ca65878bda6767f47"],["images/cryptos/qtum.svg","d8212b5ccab1ede85d84e73a16f37d91"],["images/cryptos/r.svg","64c2f5d8d67f6f152d5915146dea5077"],["images/cryptos/rads.svg","9de9b0d403def111631eb547a91b8578"],["images/cryptos/rcn.svg","ad05b24050ca3f60e89383b13cc22e8d"],["images/cryptos/rdd.svg","673ad4b6f8362693d5ebf38d1b5f1692"],["images/cryptos/rdn.svg","32d26395879fa0f907b943aad42fff8d"],["images/cryptos/rep.svg","ee4d251c8d674899da5c74b5ba66ff41"],["images/cryptos/req.svg","ea6db3eda4696f30e2cfc583d8edc849"],["images/cryptos/rhoc.svg","01aafcce56a8e8f0d1c94ec63afda297"],["images/cryptos/ric.svg","52f71752795400af76d4db8f2aca2f1f"],["images/cryptos/rise.svg","1686e5c7cbb535d1d9ed8230985b5a40"],["images/cryptos/rlc.svg","e627265e1a3dcf53f62a48626fb2f034"],["images/cryptos/rpx.svg","173161ae89570c950e7100a48fe82fa8"],["images/cryptos/rub.svg","db7a0565df76032731b785d672703e6e"],["images/cryptos/salt.svg","1798b8cafa4a645c27dd473ae7db6acb"],["images/cryptos/san.svg","32b718219c2d7bbb22b034d841a00a3f"],["images/cryptos/sbd.svg","707f0f6c0c23bff2a0b2bf55577d7654"],["images/cryptos/sberbank.svg","59e097c87b89a5432b219f673ce8b374"],["images/cryptos/sc.svg","6e80325d28d55d72362ec455cf3e4abc"],["images/cryptos/sky.svg","dffa7c5e63d27b010e93a592dce663fb"],["images/cryptos/smart.svg","66bc31c3982dfc82aa8ae354176917ea"],["images/cryptos/sngls.svg","ae5fa58a071d8be97f2aff98f169c9df"],["images/cryptos/snt.svg","20837dba51267664fff0617df1af0964"],["images/cryptos/sonm.svg","c0e0a6f8f1c9443bf38fda991f7d46b1"],["images/cryptos/sphtx.svg","9b35fbc5ef5dede7f3876a426d44c36b"],["images/cryptos/srn.svg","953ffc47d07dd550decfbb2c824ef486"],["images/cryptos/start.svg","d7389b49f5fc3e0ef8219b8318387cc2"],["images/cryptos/steem.svg","855d43574c01bcd0f3dafa17fc8755ac"],["images/cryptos/storj.svg","9c1af9543cbca833ad613d21bfc3a852"],["images/cryptos/storm.svg","dd196953bbf776863f938e123615e0d2"],["images/cryptos/strat.svg","3f097c3cede99205c0e0adb8ec3e6613"],["images/cryptos/sub.svg","d1ff1277e438a6c82cd017b61198e5f0"],["images/cryptos/sys.svg","8306b34103da7eaaef3732301c54e095"],["images/cryptos/taas.svg","da1ed60c264b85aec3ee6a332b25b35d"],["images/cryptos/tau.svg","f68acb20d9577b216a2d087d20339e3b"],["images/cryptos/tix.svg","2678bc56edc76cbaf49e2ea2d16b2ef2"],["images/cryptos/tkn.svg","a407b2c6cd044d5c0eeaaa2e6ec3c0fc"],["images/cryptos/tnc.svg","614c86ad7672673a0a3c2a28e68ffc7a"],["images/cryptos/tnt.svg","c695cda3aabd066fb1aaa5ec4d8f9f7f"],["images/cryptos/trig.svg","d66cda2d4e1f01f978af998993137c64"],["images/cryptos/trx.svg","d974e8da282a42981f44125326436eab"],["images/cryptos/tzc.svg","cd51dc785750a7055d5e0112c1c56aab"],["images/cryptos/ubq.svg","d17d354507ab50ced87dd021f87b0106"],["images/cryptos/usd.svg","509641f70865ea6d87fdd29880df0591"],["images/cryptos/usdt.svg","66f1b14738c83efe0e08e5c27b7d54ee"],["images/cryptos/ven.svg","2430f4d42c2374ac50ae3466203f0e85"],["images/cryptos/veri.svg","adc8c90bbf5d4fe9dec662e6f1edd08e"],["images/cryptos/via.svg","963fdb5e1725f8a129323f35a84ba748"],["images/cryptos/vibe.svg","24326b5322443862b765c5fc95505417"],["images/cryptos/vivo.svg","6f2e55e5eb49a796a9196ccc857963df"],["images/cryptos/vrc.svg","de74f516be8c2ae2b10a5087059466e8"],["images/cryptos/vtc.svg","4bdbf5b9472897a01f14a7d90fad5601"],["images/cryptos/wabi.svg","9f581c71789c587f48dcfeb519fdce25"],["images/cryptos/waves.svg","10c32f43c92c2fa1417cf539aa2b5ec9"],["images/cryptos/wax.svg","4cba79320783b73a2581994e49cf688c"],["images/cryptos/wtc.svg","315780a9c53936ac442e03f8acec46cb"],["images/cryptos/xbc.svg","33375391eb6e2de180e8425e02de55b8"],["images/cryptos/xcp.svg","f394caf2364d5c88522504ea7d8d3347"],["images/cryptos/xdn.svg","3311a2553541be316e0394b9eef792dd"],["images/cryptos/xem.svg","57fce401683f542e6d103e24854af512"],["images/cryptos/xlm.svg","970f2c9aeac9fe8c86a6bf990ec7dc8f"],["images/cryptos/xmg.svg","468adaa09409eddef48a600a44aa8ddf"],["images/cryptos/xmr.svg","a7d51b297fd48f326656ea724aa5cc0d"],["images/cryptos/xmy.svg","d517404f176403adfd02d4f09acd51e8"],["images/cryptos/xp.svg","552e178d76b995ddbcb7fd18077fb7a0"],["images/cryptos/xpa.svg","b648679d28977765eae6725145a48553"],["images/cryptos/xpm.svg","0a6ba582d4f5776d46652fde18fda048"],["images/cryptos/xrb.svg","601f18351c1f7841f75645759ecc4e3e"],["images/cryptos/xrp.svg","d47fb46925e90052a7a1f566812283b4"],["images/cryptos/xtz.svg","c6b48db332319acaf3e65525057d3aac"],["images/cryptos/xuc.svg","da0b5d2652ae97fda87768d437b6c857"],["images/cryptos/xvc.svg","8459152abe732a11b24fac73e69376b1"],["images/cryptos/xvg.svg","f7d3bc42ffd5a4be81c1cd2100d95bf2"],["images/cryptos/xzc.svg","f960429e974f7dca468ac0771d3745e5"],["images/cryptos/yoyow.svg","de4da77f50c851b0d0e9b8aa8ecbe30e"],["images/cryptos/zcl.svg","4fc338f4b8f79755f2caad463e194c51"],["images/cryptos/zec.svg","1224eecfe2bd7dd62c76ceeaf46b2ff8"],["images/cryptos/zen.svg","7eb8bcbcad13036090dbfee6be403ad8"],["images/cryptos/zil.svg","86c3735c510d5c92507442488d2a700d"],["images/cryptos/zrx.svg","9854c285f2482b2795b1066f396bde20"],["images/icons/icon-128x128.png","188eb89d7eaa625c297bf6ae5e2e8aa6"],["images/icons/icon-128x128.webp","7d0f69fe9463a192af42a8df3ed7c630"],["images/icons/icon-144x144.png","15ef2ddff652387b78feb406dd359315"],["images/icons/icon-144x144.webp","b413ba450de3defca9e96e0703c12814"],["images/icons/icon-152x152.png","fbd12eb75170b598fc195e1af9230b9f"],["images/icons/icon-152x152.webp","0844268fd033cebba0ec96b2abff5d51"],["images/icons/icon-192x192.png","d8f7a5b8724b0589d159c05d8db39084"],["images/icons/icon-192x192.webp","2aa01e3b9625d53ff103c1bff3bcf3b7"],["images/icons/icon-256x256.png","468ac15e0254f84ae07fa2bab9dafc80"],["images/icons/icon-256x256.webp","d79bcfc3b99d21405eca346774d81ade"],["images/icons/icon-32x32.png","9fddb87fb6ac99091158f12258964edc"],["images/icons/icon-32x32.webp","491fc81dd76256a9c5ce9d53c43a247d"],["index.html","5a8864fa450e8fb61d56da57b3c8af8b"],["manifest.json","25083eb3488f750832f344ff25512cce"],["scripts/fontfaceobserver.js","07c64efc03dcad8e4bb807463811e662"],["scripts/loadcss.full.min.js","1e346344621d6c4f8675812ecd78968f"],["scripts/main.js","45b6f09f8ba1b1d8b875bc700388b1c0"],["scripts/sw/runtime-caching.js","4f3881ee12be74267853341468418ccb"],["scripts/sw/sw-toolbox.js","2770efb889cc10c4de88d0b746c2a13c"],["styles/atf.css","f7237bd24a1fb0dee63acca5ffbf168f"],["styles/desktop.css","f41ebe68635a64153858c03582258256"],["styles/main.css","a9327933a51ec54ed23901437eea80d1"]];
var cacheName = 'sw-precache-v3-cryptowatcher-' + (self.registration ? self.registration.scope : '');


var ignoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var cleanResponse = function (originalResponse) {
    // If this is not a redirected response, then we don't have to do anything.
    if (!originalResponse.redirected) {
      return Promise.resolve(originalResponse);
    }

    // Firefox 50 and below doesn't support the Response.body stream, so we may
    // need to read the entire body to memory as a Blob.
    var bodyPromise = 'body' in originalResponse ?
      Promise.resolve(originalResponse.body) :
      originalResponse.blob();

    return bodyPromise.then(function(body) {
      // new Response() is happy when passed either a stream or a Blob.
      return new Response(body, {
        headers: originalResponse.headers,
        status: originalResponse.status,
        statusText: originalResponse.statusText
      });
    });
  };

var createCacheKey = function (originalUrl, paramName, paramValue,
                           dontCacheBustUrlsMatching) {
    // Create a new URL object to avoid modifying originalUrl.
    var url = new URL(originalUrl);

    // If dontCacheBustUrlsMatching is not set, or if we don't have a match,
    // then add in the extra cache-busting URL parameter.
    if (!dontCacheBustUrlsMatching ||
        !(url.pathname.match(dontCacheBustUrlsMatching))) {
      url.search += (url.search ? '&' : '') +
        encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
    }

    return url.toString();
  };

var isPathWhitelisted = function (whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var stripIgnoredUrlParameters = function (originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);
    // Remove the hash; see https://github.com/GoogleChrome/sw-precache/issues/290
    url.hash = '';

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
  precacheConfig.map(function(item) {
    var relativeUrl = item[0];
    var hash = item[1];
    var absoluteUrl = new URL(relativeUrl, self.location);
    var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
    return [absoluteUrl.toString(), cacheKey];
  })
);

function setOfCachedUrls(cache) {
  return cache.keys().then(function(requests) {
    return requests.map(function(request) {
      return request.url;
    });
  }).then(function(urls) {
    return new Set(urls);
  });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return setOfCachedUrls(cache).then(function(cachedUrls) {
        return Promise.all(
          Array.from(urlsToCacheKeys.values()).map(function(cacheKey) {
            // If we don't have a key matching url in the cache already, add it.
            if (!cachedUrls.has(cacheKey)) {
              var request = new Request(cacheKey, {credentials: 'same-origin'});
              return fetch(request).then(function(response) {
                // Bail out of installation unless we get back a 200 OK for
                // every request.
                if (!response.ok) {
                  throw new Error('Request for ' + cacheKey + ' returned a ' +
                    'response with status ' + response.status);
                }

                return cleanResponse(response).then(function(responseToCache) {
                  return cache.put(cacheKey, responseToCache);
                });
              });
            }
          })
        );
      });
    }).then(function() {
      
      // Force the SW to transition from installing -> active state
      return self.skipWaiting();
      
    })
  );
});

self.addEventListener('activate', function(event) {
  var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.keys().then(function(existingRequests) {
        return Promise.all(
          existingRequests.map(function(existingRequest) {
            if (!setOfExpectedUrls.has(existingRequest.url)) {
              return cache.delete(existingRequest);
            }
          })
        );
      });
    }).then(function() {
      
      return self.clients.claim();
      
    })
  );
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    // Should we call event.respondWith() inside this fetch event handler?
    // This needs to be determined synchronously, which will give other fetch
    // handlers a chance to handle the request if need be.
    var shouldRespond;

    // First, remove all the ignored parameters and hash fragment, and see if we
    // have that URL in our cache. If so, great! shouldRespond will be true.
    var url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching);
    shouldRespond = urlsToCacheKeys.has(url);

    // If shouldRespond is false, check again, this time with 'index.html'
    // (or whatever the directoryIndex option is set to) at the end.
    var directoryIndex = 'index.html';
    if (!shouldRespond && directoryIndex) {
      url = addDirectoryIndex(url, directoryIndex);
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond is still false, check to see if this is a navigation
    // request, and if so, whether the URL matches navigateFallbackWhitelist.
    var navigateFallback = '';
    if (!shouldRespond &&
        navigateFallback &&
        (event.request.mode === 'navigate') &&
        isPathWhitelisted([], event.request.url)) {
      url = new URL(navigateFallback, self.location).toString();
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond was set to true at any point, then call
    // event.respondWith(), using the appropriate cache key.
    if (shouldRespond) {
      event.respondWith(
        caches.open(cacheName).then(function(cache) {
          return cache.match(urlsToCacheKeys.get(url)).then(function(response) {
            if (response) {
              return response;
            }
            throw Error('The cached response that was expected is missing.');
          });
        }).catch(function(e) {
          // Fall back to just fetch()ing the request if some unexpected error
          // prevented the cached response from being valid.
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});







importScripts("scripts/sw/sw-toolbox.js","scripts/sw/runtime-caching.js");

