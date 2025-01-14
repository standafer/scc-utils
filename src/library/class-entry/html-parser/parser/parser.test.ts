import { expect, test } from "vitest";
import { parse } from "./parser";

test("parse to not throw", () => {
    expect(parse("<html></html>")).to.not.throw;
});

test("handle test data", () => {
    expect(
        parse(`
    <table  CLASS="datadisplaytable" SUMMARY="This layout table is used to present the sections found" width="100%"><caption class="captiontext">Sections Found</caption>
        <tr>
            <th colspan="23" CLASS="ddtitle" scope="colgroup" >Accounting</th>
        </tr>
        <tr>
            <th CLASS="ddheader" scope="col" >Select</th>
            <th CLASS="ddheader" scope="col" ><ACRONYM title = "Course Reference Number">CRN</ACRONYM></th>
            <th CLASS="ddheader" scope="col" ><ABBR title = Subject>Subj</ABBR></th>
            <th CLASS="ddheader" scope="col" ><ABBR title = Course>Crse</ABBR></th>
            <th CLASS="ddheader" scope="col" ><ABBR title = Section>Sec</ABBR></th>
            <th CLASS="ddheader" scope="col" ><ABBR title = Campus>Cmp</ABBR></th>
            <th CLASS="ddheader" scope="col" ><ABBR title = "Credit Hours">Cred</ABBR></th>
            <th CLASS="ddheader" scope="col" >Title</th>
            <th CLASS="ddheader" scope="col" >Days</th>
            <th CLASS="ddheader" scope="col" >Time</th>
            <th CLASS="ddheader" scope="col" ><ABBR title = "Section Capacity">Cap</ABBR></th>
            <th CLASS="ddheader" scope="col" ><ABBR title = "Section Actual">Act</ABBR></th>
            <th CLASS="ddheader" scope="col" ><ABBR title = "Section Remaining">Rem</ABBR></th>
            <th CLASS="ddheader" scope="col" ><ABBR title = "Waitlist Capacity">WL Cap</ABBR></th>
            <th CLASS="ddheader" scope="col" ><ABBR title = "Waitlist Actual">WL Act</ABBR></th>
            <th CLASS="ddheader" scope="col" ><ABBR title = "Waitlist Remaining">WL Rem</ABBR></th>
            <th CLASS="ddheader" scope="col" >Instructor</th>
            <th CLASS="ddheader" scope="col" >Date (<ABBR title = "month month">MM</ABBR>/<ABBR title = "day day">DD</ABBR>)</th>
            <th CLASS="ddheader" scope="col" >Location</th>
            <th CLASS="ddheader" scope="col" >Attribute</th>
        </tr>
        <tr>
            <TD CLASS="dddefault">
                <input type="checkbox" name="sel_crn" value="80644 202480" ID="action_id1" />
                <LABEL for=action_id1><SPAN class="fieldlabeltextinvisible">add to worksheet</SPAN></LABEL>
                <input type="hidden" name="assoc_term_in" value="202480" />
            </TD>
            <td CLASS="dddefault"><a href="/PROD/bwckschd.p_disp_listcrse?term_in=202480&amp;subj_in=ACCT&amp;crse_in=001&amp;crn_in=80644" onMouseOver="window.status='Detail';  return true" onFocus="window.status='Detail';  return true" onMouseOut="window.status='';  return true"onBlur="window.status='';  return true">80644</a></td>
            <td CLASS="dddefault">ACCT</td>
            <td CLASS="dddefault">001</td>
            <td CLASS="dddefault">0</td>
            <td CLASS="dddefault">M</td>
            <td CLASS="dddefault">4.000</td>
            <td CLASS="dddefault">Principles of Accounting - Financial</td>
            <td CLASS="dddefault">MW</td>
            <td CLASS="dddefault">10:00 am-11:50 am</td>
            <td CLASS="dddefault">40</td>
            <td CLASS="dddefault">29</td>
            <td CLASS="dddefault">11</td>
            <td CLASS="dddefault">24</td>
            <td CLASS="dddefault">0</td>
            <td CLASS="dddefault">24</td>
            <td CLASS="dddefault">Erica L  Beam (<ABBR title= "Primary">P</ABBR>)</td>
            <td CLASS="dddefault">08/12-12/13</td>
            <td CLASS="dddefault">0500 0505</td>
            <td CLASS="dddefault">Not Applicable - for GE (CB25) and Zero Text Book Cost</td>
        </tr>
        <tr>
            <TD CLASS="dddefault">
                <input type="checkbox" name="sel_crn" value="80645 202480" ID="action_id3" />
                <LABEL for=action_id3><SPAN class="fieldlabeltextinvisible">add to worksheet</SPAN></LABEL>
                <input type="hidden" name="assoc_term_in" value="202480" />
            </TD>
            <td CLASS="dddefault"><a href="/PROD/bwckschd.p_disp_listcrse?term_in=202480&amp;subj_in=ACCT&amp;crse_in=001&amp;crn_in=80645" onMouseOver="window.status='Detail';  return true" onFocus="window.status='Detail';  return true" onMouseOut="window.status='';  return true"onBlur="window.status='';  return true">80645</a></td>
            <td CLASS="dddefault">ACCT</td>
            <td CLASS="dddefault">001</td>
            <td CLASS="dddefault">0</td>
            <td CLASS="dddefault">VJO</td>
            <td CLASS="dddefault">4.000</td>
            <td CLASS="dddefault">Principles of Accounting - Financial</td>
            <td CLASS="dddefault">MTWRF</td>
            <td CLASS="dddefault"><ABBR title = "To Be Announced">TBA</ABBR></td>
            <td CLASS="dddefault">40</td>
            <td CLASS="dddefault">39</td>
            <td CLASS="dddefault">1</td>
            <td CLASS="dddefault">24</td>
            <td CLASS="dddefault">6</td>
            <td CLASS="dddefault">18</td>
            <td CLASS="dddefault">Erica L  Beam (<ABBR title= "Primary">P</ABBR>)</td>
            <td CLASS="dddefault">08/12-12/13</td>
            <td CLASS="dddefault">ONLINE </td>
            <td CLASS="dddefault">Not Applicable - for GE (CB25) and Zero Text Book Cost</td>
        </tr>
    </table>`),
    ).to.not.throw;

    // TODO: Implement proper tests
});
