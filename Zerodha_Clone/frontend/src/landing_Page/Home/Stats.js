import React from 'react';

function Stats() {
    return ( 
        <div classname="container p-3">
            <div className="row p-5">
                <div className="col-6 p-5">
                    <h1 className='fs-2 mb-5'>Trust with Confidence</h1>
                    <h2 className='fs-4'>Customer-first always</h2>
                    <p className='text-muted'>That's why 1.6+ crore customers trust Zerodha with ~ ₹6 lakh crores of equity investments, making us India’s largest broker; contributing to 15% of daily retail exchange volumes in India.</p>
                    <h2 className='fs-4'>No spam or gimmicks</h2>
                    <p className='text-muted'>No gimmicks, spam, "gamification", or annoying push notifications. High quality apps that you use at your pace, the way you like. <a href='' style={{textDecoration:"none"}}>Our philosophies.</a> </p>
                    <h2 className='fs-4'>The Zerodha universe</h2>
                    <p className='text-muted'>Not just an app, but a whole ecosystem. Our investments in 30+ fintech startups offer you tailored services specific to your needs.</p>
                     <h2 className='fs-4'>Do better with money</h2>
                     <p className='text-muted'>With initiatives like <a href=''style={{textDecoration:"none"}}>Nudge</a> and <a href='' style={{textDecoration:"none"}}>Kill Switch</a>, we don't just facilitate transactions, but actively help you do better with your money.</p>
                </div>
                <div className="col-6 mr-5 p-5">
                   <img src='media/images/ecosystem.png' style={{width:'100%'}}/>
                   <div>
                       <a href='' className="mx-5" style={{textDecoration:"none"}}>Explore our products <i class="fas fa-long-arrow-alt-right"></i></a>
                       <a href='' className='mx-5' style={{textDecoration:"none"}}>Try Kite demo <i class="fas fa-long-arrow-alt-right"></i></a>
                   </div>
                </div>
                
            </div>
        </div>
     );
}

export default Stats;