<h1>Release notes Orchestra Web Counter 4.0.0</h1>

----------

<h2>Introduction</h2>

This document describes the new features, bug corrections, known issues and recommendations for Orchestra Web Counter 1.0.0. If you want to know about connector changes details or similar, this document is for you.

**Note:** Several of the remarks refer to a Jira number (Jira is Qmatic&#39;s internal registration system for bugs), or Pivotal Tracker (internal system for improvements and other issues).


<h2>Version 4.0.0.029</h2>

**Date: 30/08/2019**

**Build number: 028**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **167084467** | **Indicate charachter limit to user** |
| **000000000** | **Added WCAG support** |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **167338530** | **GUI issue in create customer form** |
| **167338834** | **Create customer form validation issues** |
| **167776865** | **Visit card > After add a service to the visit, user will see the visit card behind the add service window.** |
| **167776866** | **When there is no Mark type is set from UTT, not to show 'Add a mark' link in the visit card.** |
| **167993307** | **Walk in customer > service search is not working.** |
| **168070913** | **Serve Page / Note field character limit exceed message** |
| **167421044** | **date of birth" field label text is not reading from screen reader (NVDA)** |
| **167452543** | **WCAG - Add customer > mandatory fields are getting red once user tab on it.** |
| **167479893** | **Add Marks > validation issues in no of marks field** |

<h3>Known issues</h3>

<h3>Upgrade instructions</h3>
----------

<h2>Version 4.0.0.027</h2>

**Date: 05/06/2019**

**Build number: 027**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **166081841** | **WCAG - CP10 - Contrast between foreground and background** Change colors, added validation messages to customer forms |
| **166026887** | **WCAG - Tabbing NL20/NL30** Improve tabbing, change focus to popovers on initialization and destruction, change styling to indicate focus on custom tabable elements, group links in header |
| **166080611** | **WCAG - Bypass Blocks - NL50** Add anchor link shortcuts to card and action panel |
| **166030010** | **WCAG - SW60 - Move Focus ** Move focus to card top when pressing WALK-IN, Add service to visit, Add marks, Call next, Add Ds/Outcome |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **xxx** xxx |

<h3>Known issues</h3>

<h3>Upgrade instructions</h3>
----------


<h2>Version 4.0.0.022</h2>

**Date: 15/04/2019**

**Build number: 022**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **164824646** | **Call any service in a multi service visit** Add serve buttons to multi services in visit card |
| **COUNTER-126** | **Setting to set several Mark Types for a counter and show the marks grouped in the Counter** Add dropdown to select mark type before selecting mark |
| **COUNTER-127** | **Remove users active session (GAP BNLX/UK)** Add option to force logout |
| **COUNTER-129** | **Transfer with delay for visit/multi-service visit (GAP BNLX)** Add option to transfer with delay from queue |
| **166081841** | **WCAG - CP10 - Contrast between foreground and background** Change colors, added validation messages to customer forms |
| **166026887** | **WCAG - Tabbing NL20/NL30** Improve tabbing, change focus to popovers on initialization and destruction, change styling to indicate focus on custom tabable elements, group links in header |
| **166080611** | **WCAG - Bypass Blocks - NL50** Add anchor link shortcuts to card and action panel |
| **166030010** | **WCAG - SW60 - Move Focus ** Move focus to card top when pressing WALK-IN, Add service to visit, Add marks, Call next, Add Ds/Outcome |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **COUNTER-134** | **Cannot call next visit** Removed loop checking visit state during visit in display queue, added checks for empty responses in queues and pools |
| **COUNTER-137** | **custom_1 field includes too many characters and makes statistics end up in failed events** Removed encoding when saving notes |
| **COUNTER-138** | **LED does not show called ticket after StoreNext call from WebServicepoint** UTT adjustments to REMOVE_USER_FROM_STORE_NEXT |
| **COUNTER-140** | **Hard to see Mark Types options on small screens** Adjustment of dropdown heights for marks dropdowns |
| **COUNTER-143** | **Need to click TWICE after search** Fixed event listener for custom search |
| **COUNTER-145** | **workstationTerminalMessages.properties > spelling mistakes in English phases** Corrected spelling |

<h3>Known issues</h3>

<h3>Upgrade instructions</h3>
----------

----------

<h2>Version 4.0.0.021</h2>

**Date: 18/03/2019**

**Build number: 021**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **164398417** | **counter story** Add cancel button to multi service modal |
| **163318753** | **Use system parameter for date** Use system parameter when displaying date |
| **160344676** | **Update description for the Multisession counter utt** UTT changes, updated description of WebCounterMultiStaff |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **COUNTER-122** | **Possible to press counter before a branch is selected** Removed outline for custom select |
| **COUNTER-125** | **Expressia can still be used after the customer is transferred** UTT Changes to Expressia and Expressia_D924 |

<h3>Known issues</h3>

<h3>Upgrade instructions</h3>
----------

----------

<h2>Version 4.0.0.020</h2>

**Date: 11/01/2019**

**Build number: 020**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **xxx** xxx |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **COUNTER-119** | **Filter text - transfer options** Color change on input fields and added clear button to search fields in transfer searches and walk in card. |
| **COUNTER-120** | **Servicepoint LED does not switch to "open" message when ending visit after adding service** Changes to UTT for unitEvent END_SERVICE. |


<h3>Known issues</h3>

<h3>Upgrade instructions</h3>
----------

----------

<h2>Version 4.0.0.019</h2>

**Date: 20/12/2018**

**Build number: 019**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **xxx** xxx |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **COUNTER-116** | **Undefined Undefined selected when user click "No Customer found text"** Not setting click listener when result array is empty. |
| **COUNTER-117** | **Update readme instruction on github** Added fallback proxy url to orchestra and assuming it is running on localhost port 8080, updated readme with changed filename of gulp config. |

<h3>Known issues</h3>

<h3>Upgrade instructions</h3>
----------

----------

<h2>Version 4.0.0.018</h2>

**Date: 22/10/2018**

**Build number: 018**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **161107886** | **AM/PM & 24 Hour format** Now using orchestra setting for am/pm to determine how to display appointment times in queue and on visit card |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **Story text** Story text |

<h3>Known issues</h3>

<h3>Upgrade instructions</h3>
----------

----------

<h2>Version 4.0.0.017</h2>

**Date: 12/10/2018**

**Build number: 017**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **161047690** | **Make workstationterminal.war compatible between current Orchestra 7.0 (4.0.0.418) and future 7.1** Update web.xml |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **Story text** Story text |

<h3>Known issues</h3>

<h3>Upgrade instructions</h3>
----------

----------

<h2>Version 4.0.0.016</h2>

**Date: 14/09/2018**

**Build number: 016**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **160168779** | **Show Appointment Time in the visit card** Show appointment time in visit card |
| **159847899** | **User-/servicepointpool name not visible** Added title on hover |
| **158180727** | **Update regex for phone number when creating /edit customer** Updated validation of phone number |
| **160168889** | **Show Serving Time info next to Transaction Time** Show expected Serving Time info next to Transaction Time |
| **155973320** | **Date of birth add to Customer object** Add date of birth to create and edit customer and print date of birth in additional customer list |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **Story text** Story text |

<h3>Known issues</h3>

<h3>Upgrade instructions</h3>
----------

----------

<h2>Version 4.0.0.015</h2>

**Date: 31/08/2018**

**Build number: 015**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **160163513** | **Update icons for Counter** Update icons for Counter and UTTs |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **Story text** Story text |

<h3>Known issues</h3>

<h3>Upgrade instructions</h3>
----------

----------

<h2>Version 4.0.0.014</h2>

**Date: 27/06/2018**

**Build number: 014**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **Story header** Story text |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **158627159** | **Search customer with phone number with + does not return any response** |

<h3>Known issues</h3>

<h3>Upgrade instructions</h3>
----------

----------

<h2>Version 4.0.0.013</h2>

**Date: 26/02/2018**

**Build number: 013**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **Story header** Story text |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **157141258** | **Transferring visits does not update the order in the queue GUI** |

<h3>Known issues</h3>

<h3>Upgrade instructions</h3>
----------

----------

<h2>Original release</h2>

**Date: 10/01/2018**

**Build number: 001**

<h3>Stories</h3>

| **Id** | **Release notes** |
| :--- | :--- |
| **xxx** | **Story header** Story text |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **Bug header** Bug text |


<h3>Known issues</h3>
**Orchestra Web Counter**

| **Id/Jira** | **Description** |
| --- | --- |
| **xxx** | **Bug header** Bug text |

<h3>Upgrade Instructions</h3>
----------

<h3>Copyright notice</h3>

The information in this document is subject to change without prior notice and does not represent a commitment on the part of Q-MATIC AB. All efforts have been made to ensure the accuracy of this manual, but Q-MATIC AB cannot assume any responsibility for any errors and their consequences.

This manual is copyrighted and all rights are reserved.
Qmatic and Qmatic Orchestra are registered trademarks or trademarks of Q-MATIC AB.
Reproduction of any part of this manual, in any form, is not allowed, unless written permission is given by Q-MATIC AB.
COPYRIGHT (c) Q-MATIC AB, 2018.

