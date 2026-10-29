# Additional head score imports

All assets are score-timed melody studies. Their timing has not been aligned to YouTube recordings. Ensemble arrangements use a specified lead part rather than an inferred composite melody. Source pitches, ties, meter and encoded repeats were preserved; explicit MusicXML instrument transpositions converted to sounding pitch.

## PDMX

Public dataset version9: https://zenodo.org/records/15571083 . Source rows selected with no reported license conflict and no paywall. Dataset collection attribution: Phillip Long, Zachary Novack, Taylor Berg-Kirkpatrick, Julian McAuley, *PDMX: A Large-Scale Public Domain MusicXML Dataset for Symbolic Music Processing*, ICASSP2025. Also Weihan Xu, Julian McAuley, Taylor Berg-Kirkpatrick, Shlomo Dubnov, Hao-Wen Dong, *Generating Symbolic Music from Natural Language Prompts using an LLM-Enhanced Dataset* (2024). Original source contributors and license URLs follow. Dataset public-domain labels describe contributor submissions; no claim that underlying modern compositions have lost copyright.

- Nostalgia In Times Square: bjo1; https://musescore.com/user/33848507/scores/5937586; source label https://creativecommons.org/publicdomain/zero/1.0/.
- My Way: diegocampos; https://musescore.com/user/156353/scores/155180; source label https://creativecommons.org/publicdomain/mark/1.0/.
- Detour Ahead: HenrikClausen; https://musescore.com/user/4213646/scores/4886073; source label https://creativecommons.org/publicdomain/zero/1.0/.
- Turn Out The Stars: Assaf Patir; https://musescore.com/user/9534326/scores/5146629; source label https://creativecommons.org/publicdomain/zero/1.0/.
- Somebody Loves Me: peter_scott71; https://musescore.com/user/28851728/scores/5917244; source label https://creativecommons.org/publicdomain/zero/1.0/.
- Road Song: dvossos; https://musescore.com/user/62063/scores/86404; source label https://creativecommons.org/publicdomain/mark/1.0/.
- Whispering: Robipad; https://musescore.com/user/138202/scores/1430346; source label https://creativecommons.org/publicdomain/zero/1.0/.
- Memories Of Tomorrow: setrar; https://musescore.com/setrar/scores/784261; source label https://creativecommons.org/publicdomain/mark/1.0/.
- When You Wish Upon A Star: Amauri Barbosa; https://musescore.com/user/5426666/scores/5823596; source label https://creativecommons.org/publicdomain/zero/1.0/.
- Just One More Chance: warren.raftshol.9; https://musescore.com/user/110643/scores/5290009; source label https://creativecommons.org/publicdomain/zero/1.0/.

## OpenBook

Little Boat (O Barquinho), entered by Laurent Martelli; U.M.M.G., OpenBook contributors. Repo https://github.com/veltzer/book-openbook commit e87c232793312d9f6ce404397fb528aa38c829b6. MIT repository license retained at ../head-expansion/openbook/LICENSE. Original composition credits preserved in sourcefiles. Little Boat contains16-bar head; empty coda scaffolding removed. UMMG transposed from source C to concert Db per source CFr/CTo instructions, retaining written ending vamp.

## Omnibook

50 original full MusicXML transcriptions from https://homepages.loria.fr/evincent/omnibook/ . MusicXML provided by Inria (Ken Deguernel, Emmanuel Vincent), STMS Lab/Ircam/CNRS/UPMC (Ken Deguernel, Gerard Assayag). Original copyrights Atlantic Music Corp. Data CC BY-NC-SA2.0 UK; exact license retained at omnibook/Omnibook xml/LICENCE.txt. Cite Deguernel, Vincent, Assayag, *Using Multidimensional Sequences for Improvisation in the OMax Paradigm*, SMC2016. The omnibook-ready.json contains full scores, not isolated heads and not performance-aligned timings.

## Excluded candidates

False title matches: Witch Hunt(Vocaloid), Moonchild(King Crimson), Sugar(Robin Schulz), folk Dedicated To You/Think On Me/Passion Flower. Tune Up has only12filled bars then20empty bars; Sidewinder is drums-only. My Buddy/Broadway in shiehn corpus lack reliable complete form/meter. Seven Come Eleven explicitly Charlie Christian guitar solo, saved separately and never marked as a head. Full House old LilyPond relative notation remains unverified; no asset imported.

Repeat repair: In The Mood and Dream A Little Dream Of Me exported adjacent ending measures as separate RepeatBracket objects. Joined consecutive same-number/blank continuation brackets before expansion; source score files and repaired copies preserved.

- In The Mood: MakeMusic88; https://musescore.com/user/2435866/scores/6168123; https://creativecommons.org/publicdomain/zero/1.0/.
- Dream A Little Dream Of Me: HookedOnTonics; https://musescore.com/user/33888481/scores/5973143; https://creativecommons.org/publicdomain/zero/1.0/.
