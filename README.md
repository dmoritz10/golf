# golfscorecard-v3
 
https://dmoritz10.github.io/golfscorecard-v3/


x Fix WGS Handicap
    Fix Course Handicap 
    Fix Target Score Calc

    Round Stats called from 
        Scorecard
        Handicap
        Rounds

    Playround called from
        Courses
        Home.btnPlayRound

x Fix re-positioning to top of listing
    Courses - edit course
    Courses - Playround

    Rounds - Round Stats
    Handicap - Round Stats

x Fix Courses Maintenance
    Calc Bogey Rating
    Calc default front / back ratings

x Fix weather rpt on SMS from Tee Times

x Port Course Maintenance
    x Full Courses Maintenance
    course delete

x Sort Courses after add

x Retro show-hcp to getRounds

Re-format home

                tee times

    Handicap	Rounds		Stats

    Courses		Golfers		Clubs

                Play round

                Settings 

x Post Round Save

    x calc hcp

        get mostRecent20HcpDiff(hcpMethod, hcpIncludeSmall)
        store in Options
        calc hcp
        store in Options


    x Update Courses - i think I'm done
        Nbr Times Played        !	=>  Add one
        Avg Play Time	        !   =>  Calc
        
        Course Handicap	        ?   =>  Courses - Crs Hcp & Playround - Crs Hcp
        Target Score	        ?   =>  
            calcTargetScore(mostRecent20HcpDiff, targetHandicap, courseRating, slopeRating, courseRatingFront9)
        Course Equivalent Score ?

    x Update Options
        Current Handicap
        Nbr Rounds

Deprecate
    x (arrOptions['Handicap Diff Count']*1 + 1)) / .96) - arrOptions['Handicap Diff Sum']
    calcTS
    x currHandicap = arrOptions['Current Handicap']

x clone 'Settings' from 'Options'


x stats


x Fix weather report on sms

</a></div></div><p _ngcontent-sc271="">
</a></div ></div > <p _ngcontent

X fix Playround 
      $('#hpNbr_Times_Played').html ( courseInfo['Nbr Times Played'])
      $('#hpAvg_Play_Time').html ( courseInfo['Avg Play Time'])


x fix stats putting
    last 100 rounds putts / gir

x Fix Target Score = fixed

x Fix Hole Detail in Courses 
    courses.holeDetail = can't set lat/lng because prCourse not initialized

Tackle gender issue more generally

x Fix Calendar updates / deletes

x add nbr of times played to Golfers

x f/m for local courses = rename as 'favorite'

x Change name to Dan Golf - emailName


Firefox - scrub this as mozilla not supporting pwa s ?????
    permissions for geolocation
    sizing
    install pwa

x Start from scratch
    courses
    scorecards
    settings

x Save Sxs Hold Detail just in case

x Clear round after successful append

x Recover Costa Mesa Country Club  (Los Lagos Course)	7/25/19  from Scorecards

x test collabration

x test for uniqueness golfers and clubs -->

x versioning - have an ok solution

x stats - line of closest fit for 

    hcp in CAS
    avg score by par
    tee to green

x Rounds - sort option

    Sort by Date Played
    Sort by Best Rounds (hcp diff)

    add reset button to pull down

x Include score by par in round stats pulldown

x replace dup ids with classes

x reset button for rounds, courses and stats

x replace rtnto

x remove usga hcp method

add more info on club distance to round stats

hcp with 2 rounds

conditionally fetch scorecards

x method to force recalc

rename sheets
    My Courses to Courses
    scorecard upload to scorecards

rework wgs handicap calc

    x remove .96
    
    courseHandicap

        current
            x teetime screen - display
            x play round - display and recalc
            round stats




        historical
    
Remove initial rounds (ie. no hcpdiff) from Stats esp. 'made target'


course handicap => handicap index
tesy

Will there still be exceptional scoring reductions (ESR)?
Yes, but only if a player submits a score that produces a score differential that is seven strokes or more below their handicap index. 

– If the score is 7.0 – 9.9 strokes better: A -1.0 handicap index adjustment will be applied.
– If the score is 10.0 or more strokes better: A -2.0 handicap index adjustment will be applied.     

What happens if I fail to complete a full nine-hole or 18-hole round because of fading light?
If you fail to play the minimum number of holes required, the score is disregarded. For a nine-hole round, all nine holes must be completed. For an 18-hole round, at least 10 holes must be completed. If you play more than 10 holes but less than 14, you will be allocated nett par plus one stroke for the first hole not played and then nett par for the remaining holes. If you play 14 or more holes, you will be allocated nett par for the remaining holes. 

What if you are new to golf? How would you obtain a handicap index?
By submitting scores of 3 x 18 holes, 6 x 9 holes or a combination of both. Revisions will be daily, so once they’ve submitted scorecards totalling 54 holes or more, an initial handicap index will be awarded and based on an adjusted average relative to the number of scores that have been submitted. This will continue until a fully-developed handicap with 20 scores on record is achieved.

How will my new handicap be calculated?
Start with your handicap index. This will form the basis for your course and playing handicap. Every score in a player’s handicap record will be converted to a score differential. This is calculated by multiplying the difference between your gross score and the course rating by 113, and dividing by the slope rating of the tees that were played.

6.1a For an 18-hole Round
An 18-hole Course Handicap is calculated as follows:

Course Handicap	=	Handicap Index	x	(Slope Rating ÷ 113)	+	(Course Rating – par)
Note: An 18-hole Course Handicap based on the same 9 holes is calculated as follows:

Course Handicap	=	Handicap Index	x	(9-hole Slope Rating ÷ 113)	+	(2 x 9-hole Course Rating – 2 x 9-hole par)
6.1b For a 9-hole Round
A 9-hole Course Handicap is calculated as follows:

Course Handicap	=	(Handicap Index ÷ 2)	x	(9-hole Slope Rating ÷ 113)	+	(9-hole Course Rating – 9-hole par)