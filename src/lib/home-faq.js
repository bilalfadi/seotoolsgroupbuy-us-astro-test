/** Section 8: homepage FAQ visual enhancement (CMS answers preserved). */
export function upgradeHomeFaq(markup){
 const begin=markup.indexOf('<section class="s5-faq"');
 if(begin<0)return markup;
 const end=markup.indexOf('</section>',begin);
 if(end<0)return markup;
 let original=markup.slice(begin,end+10);
 if(original.includes('s5-faq__more'))return markup;
 const marker='    <div class="s5-faq__list">';
 if(!original.includes(marker))return markup;
 // Existing close-tag finishes the header: move it after the button via minimal replacement.
 original=original.replace('    </div>\n\n'+marker,'      <a class="s5-faq__more" href="/frequently-asked-questions-faqs-for-an-seo-group-buy/">Browse the full FAQ <span aria-hidden="true">→</span></a>\n    </div>\n\n'+marker);
 return markup.slice(0,begin)+original+markup.slice(end+10);
}
